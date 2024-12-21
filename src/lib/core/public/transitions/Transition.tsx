import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import TransitionGroupContext from './private/TransitionGroupContext';
import { forceReflow } from './private/utils/ForceReflow';
import config from './config';
import TransitionProps, {
  ENTERED,
  ENTERING,
  EXITED,
  EXITING,
  TransitionStatus,
  UNMOUNTED,
} from './types';

const Transition: React.FC<TransitionProps> = ({
  children,
  // filter props for `Transition`
  in: _in,
  mountOnEnter: _mountOnEnter,
  unmountOnExit: _unmountOnExit,
  appear: _appear,
  enter: _enter,
  exit: _exit,
  timeout: _timeout,
  addEndListener: _addEndListener,
  onEnter: _onEnter,
  onEntering: _onEntering,
  onEntered: _onEntered,
  onExit: _onExit,
  onExiting: _onExiting,
  onExited: _onExited,
  nodeRef: _nodeRef,
  ...childProps
}) => {
  const parentGroup = useContext(TransitionGroupContext);
  const appearStatusRef = useRef<string | null>(null);

  const [status, setStatus] = useState<TransitionStatus>(() => {
    if (_in) {
      if (parentGroup && !parentGroup.isMounting ? _enter : _appear) {
        return EXITED;
      } else {
        return ENTERED;
      }
    } else {
      if (_unmountOnExit || _mountOnEnter) {
        return UNMOUNTED;
      } else {
        return EXITED;
      }
    }
  });

  const nextCallbackRef = useMemo(
    () => ({ current: null as (() => void) | null, cancel: () => {} }),
    [],
  );

  const getTimeouts = () => {
    let exit, enter, appear;

    exit = enter = appear = _timeout;

    if (_timeout != null && typeof _timeout !== 'number') {
      exit = _timeout.exit;
      enter = _timeout.enter;
      // TODO: remove fallback for next major
      appear = _timeout.appear !== undefined ? _timeout.appear : enter;
    }
    return { exit, enter, appear };
  };

  const updateStatus = (mounting: boolean, nextStatus: string | null) => {
    if (nextStatus !== null) {
      cancelNextCallback();

      if (nextStatus === ENTERING) {
        if (_unmountOnExit || _mountOnEnter) {
          const node = _nodeRef!.current; //ReactDOM.findDOMNode(this);
          if (node) forceReflow(node);
        }
        performEnter(mounting);
      } else {
        performExit();
      }
    } else if (_unmountOnExit && status === EXITED) {
      setStatus(UNMOUNTED);
    }
  };

  const performEnter = (mounting: boolean) => {
    const appearing = parentGroup ? parentGroup.isMounting : mounting;
    const node = _nodeRef!.current; //ReactDOM.findDOMNode(this);

    const timeouts = getTimeouts();
    const enterTimeout = appearing ? timeouts.appear : timeouts.enter;

    if ((!mounting && !_enter) || config.disabled) {
      setStatus(ENTERED);
      _onEntered?.(node!, appearing);
      return;
    }

    _onEnter?.(node!, appearing);
    setStatus(ENTERING);

    _onEntering?.(node!, appearing);
    onTransitionEnd(enterTimeout as number, () => {
      setStatus(ENTERED);
      _onEntered?.(node!, appearing);
    });
  };

  const performExit = () => {
    const node = _nodeRef!.current; //ReactDOM.findDOMNode(this);
    const timeouts = getTimeouts();

    if (!_exit || config.disabled) {
      setStatus(EXITED);
      _onExited?.(node!);
      return;
    }

    _onExit?.(node!);
    setStatus(EXITING);

    _onExiting?.(node!);
    onTransitionEnd(timeouts.exit as number, () => {
      setStatus(EXITED);
      _onExited?.(node!);
    });
  };

  const cancelNextCallback = () => {
    if (nextCallbackRef.current !== null) {
      nextCallbackRef.cancel();
      nextCallbackRef.current = null;
    }
  };

  const setNextCallback = (callback: () => void) => {
    let active = true;
    nextCallbackRef.current = () => {
      if (active) {
        active = false;
        nextCallbackRef.current = null;

        callback();
      }
    };

    nextCallbackRef.cancel = () => {
      active = false;
    };

    return nextCallbackRef.current;
  };

  const onTransitionEnd = (timeout: number | null, handler: () => void) => {
    setNextCallback(handler);
    const node = _nodeRef!.current; //ReactDOM.findDOMNode(this);

    const noTimeoutOrListener = timeout == null && !_addEndListener;

    if (!node || noTimeoutOrListener) {
      setTimeout(nextCallbackRef.current!, 0);
      return;
    }

    if (_addEndListener) {
      _addEndListener(node, nextCallbackRef.current!);
    }

    if (timeout != null) {
      setTimeout(nextCallbackRef.current!, timeout);
    }
  };

  useEffect(() => {
    updateStatus(true, appearStatusRef.current);
  }, []);

  useEffect(() => {
    let nextStatus = null;
    if (_in) {
      if (status !== ENTERING && status !== ENTERED) {
        nextStatus = ENTERING;
      }
    } else {
      if (status === ENTERING || status === ENTERED) {
        nextStatus = EXITING;
      }
    }
    updateStatus(false, nextStatus);
  }, [_in]);

  useEffect(() => {
    return () => {
      cancelNextCallback();
    };
  }, []);

  if (status === UNMOUNTED) {
    return null;
  }

  return (
    <TransitionGroupContext.Provider value={null}>
      {typeof children === 'function'
        ? children(status, childProps)
        : React.isValidElement(children)
          ? React.cloneElement(React.Children.only(children), childProps)
          : null}
    </TransitionGroupContext.Provider>
  );
};

export default Transition;
