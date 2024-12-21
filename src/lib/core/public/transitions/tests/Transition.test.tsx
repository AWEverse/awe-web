/**
 * @jest-environment jsdom
 */
import React, { FC, RefObject, useState } from 'react';

import { render, waitFor } from './utils';

import Transition from '../Transition';
import { ENTERING, EXITING, ENTERED, TransitionStatus, EXITED } from '../types';

expect.extend({
  toExist(received) {
    const pass = received != null;
    return pass
      ? {
          message: () => `expected ${received} to be null or undefined`,
          pass: true,
        }
      : {
          message: () => `expected ${received} not to be null or undefined`,
          pass: false,
        };
  },
});

describe('Transition', () => {
  it('should not transition on mount', () => {
    const nodeRef = React.createRef<HTMLDivElement>();

    render(
      <Transition
        in
        // @ts-ignore
        nodeRef={nodeRef}
        timeout={0}
        onEnter={() => {
          throw new Error('should not Enter');
        }}
      >
        {status => <div ref={nodeRef}>status: {status}</div>}
      </Transition>,
    );

    expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERED}`);
  });

  it('should transition on mount with `appear`', done => {
    const nodeRef = React.createRef<HTMLDivElement>();
    render(
      <Transition
        in // @ts-ignore
        nodeRef={nodeRef}
        timeout={0}
        onEnter={() => {
          throw Error('Animated!');
        }}
      >
        <div ref={nodeRef} />
      </Transition>,
    );

    render(
      <Transition
        // @ts-ignore
        nodeRef={nodeRef}
        in
        appear
        timeout={0}
        onEnter={() => done()}
      >
        <div ref={nodeRef} />
      </Transition>,
    );
  });

  it('should pass filtered props to children', () => {
    // class Child extends React.Component {
    //   render() {
    //     return (
    //       <div ref={this.props.nodeRef}>
    //         foo: {this.props.foo}, bar: {this.props.bar}
    //       </div>
    //     );
    //   }
    // }

    const Child: FC<{
      nodeRef: RefObject<HTMLDivElement | null>;
      foo?: string;
      bar?: string;
    }> = React.memo(({ nodeRef, foo, bar }) => (
      <div ref={nodeRef}>
        foo: {foo}, bar: {bar}
      </div>
    ));

    const nodeRef = React.createRef<HTMLDivElement>();

    render(
      <Transition
        foo="foo"
        bar="bar"
        in
        // @ts-ignore
        nodeRef={nodeRef}
        mountOnEnter
        unmountOnExit
        appear
        enter
        exit
        timeout={0}
        addEndListener={() => {}}
        onEnter={() => {}}
        onEntering={() => {}}
        onEntered={() => {}}
        onExit={() => {}}
        onExiting={() => {}}
        onExited={() => {}}
      >
        <Child nodeRef={nodeRef} />
      </Transition>,
    );

    expect(nodeRef.current!.textContent).toBe('foo: foo, bar: bar');
  });

  it('should allow addEndListener instead of timeouts', async () => {
    let listener = jest.fn(end => setTimeout(end, 0));
    let done = false;

    const nodeRef = React.createRef<HTMLDivElement>();

    const { setProps } = render(
      <Transition
        // @ts-ignore

        nodeRef={nodeRef}
        addEndListener={listener}
        onEntered={() => {
          expect(listener).toHaveBeenCalledTimes(1);
          done = true;
        }}
      >
        <div ref={nodeRef} />
      </Transition>,
    );

    setProps({ in: true });

    await waitFor(() => {
      expect(done).toEqual(true);
    });
  });

  it('should fallback to timeouts with addEndListener', async () => {
    let calledEnd = false;
    let done = false;
    let listener = (end: any) =>
      setTimeout(() => {
        calledEnd = true;
        end();
      }, 100);

    const nodeRef = React.createRef<HTMLDivElement>();

    const { setProps } = render(
      <Transition
        timeout={0}
        // @ts-ignore
        nodeRef={nodeRef}
        addEndListener={listener}
        onEntered={() => {
          expect(calledEnd).toEqual(false);
          done = true;
        }}
      >
        <div ref={nodeRef}></div>
      </Transition>,
    );

    setProps({ in: true });

    await waitFor(() => {
      expect(done).toEqual(true);
    });
  });

  it('should mount/unmount immediately if not have enter/exit timeout', async () => {
    const nodeRef = React.createRef<HTMLDivElement>();

    let done = false;
    const { setProps } = render(
      <Transition // @ts-ignore
        nodeRef={nodeRef}
        in={true}
        timeout={{}}
      >
        {status => <div ref={nodeRef}>status: {status}</div>}
      </Transition>,
    );

    expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERED}`);
    let calledAfterTimeout = false;
    setTimeout(() => {
      calledAfterTimeout = true;
    }, 10);
    setProps({
      in: false,
      onExited() {
        expect(nodeRef.current!.textContent).toEqual(`status: ${EXITED}`);
        if (calledAfterTimeout) {
          throw new Error('wrong timeout');
        }
        done = true;
      },
    });

    await waitFor(() => {
      expect(done).toEqual(true);
    });
  });

  // it('should use `React.findDOMNode` when `nodeRef` is not provided', () => {
  //   const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  //   const findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode');

  //   render(
  //     <Transition in appear timeout={0}>
  //       <div />
  //     </Transition>,
  //   );

  //   expect(findDOMNodeSpy).toHaveBeenCalled();
  //   findDOMNodeSpy.mockRestore();
  //   consoleSpy.mockRestore();
  // });

  // it('should not use `React.findDOMNode` when `nodeRef` is provided', () => {
  //   const findDOMNodeSpy = jest.spyOn(ReactDOM, 'findDOMNode');

  //   const nodeRef = React.createRef<HTMLDivElement>();

  //   render(
  //     <Transition nodeRef={nodeRef} in appear timeout={0}>
  //       <div ref={nodeRef} />
  //     </Transition>,
  //   );

  //   expect(findDOMNodeSpy).not.toHaveBeenCalled();
  //   findDOMNodeSpy.mockRestore();
  // });

  describe('appearing timeout', () => {
    it('should use enter timeout if appear not set', async () => {
      let calledBeforeEntered = false;
      let done = false;
      setTimeout(() => {
        calledBeforeEntered = true;
      }, 10);
      const nodeRef = React.createRef<HTMLDivElement>();

      const { setProps } = render(
        // @ts-ignore

        <Transition nodeRef={nodeRef} in={true} timeout={{ enter: 20, exit: 10 }} appear>
          <div ref={nodeRef} />
        </Transition>,
      );

      setProps({
        onEntered() {
          if (calledBeforeEntered) {
            done = true;
          } else {
            throw new Error('wrong timeout');
          }
        },
      });

      await waitFor(() => {
        expect(done).toEqual(true);
      });
    });

    it('should use appear timeout if appear is set', async () => {
      let done = false;
      const nodeRef = React.createRef<HTMLDivElement>();

      const { setProps } = render(
        // @ts-ignore

        <Transition nodeRef={nodeRef} in={true} timeout={{ enter: 20, exit: 10, appear: 5 }} appear>
          <div ref={nodeRef} />
        </Transition>,
      );

      let isCausedLate = false;
      setTimeout(() => {
        isCausedLate = true;
      }, 15);

      setProps({
        onEntered() {
          if (isCausedLate) {
            throw new Error('wrong timeout');
          } else {
            done = true;
          }
        },
      });

      await waitFor(() => {
        expect(done).toEqual(true);
      });
    });
  });

  describe('entering', () => {
    it('should fire callbacks', async () => {
      let callOrder: string[] = [];
      let done = false;
      let onEnter = jest.fn(() => callOrder.push('onEnter'));
      let onEntering = jest.fn(() => callOrder.push('onEntering'));
      const nodeRef = React.createRef<HTMLDivElement>();

      const { setProps } = render(
        // @ts-ignore

        <Transition nodeRef={nodeRef} timeout={10}>
          {status => <div ref={nodeRef}>status: {status}</div>}
        </Transition>,
      );

      expect(nodeRef.current!.textContent).toEqual(`status: ${EXITED}`);

      setProps({
        in: true,

        onEnter,

        onEntering,

        onEntered() {
          expect(onEnter).toHaveBeenCalledTimes(1);
          expect(onEntering).toHaveBeenCalledTimes(1);
          expect(callOrder).toEqual(['onEnter', 'onEntering']);
          done = true;
        },
      });

      await waitFor(() => {
        expect(done).toEqual(true);
      });
    });

    it('should move to each transition state', async () => {
      let count = 0;
      const nodeRef = React.createRef<HTMLDivElement>();

      const { setProps } = render(
        // @ts-ignore

        <Transition nodeRef={nodeRef} timeout={10}>
          {status => <div ref={nodeRef}>status: {status}</div>}
        </Transition>,
      );

      expect(nodeRef.current!.textContent).toEqual(`status: ${EXITED}`);

      setProps({
        in: true,

        onEnter() {
          count++;
          expect(nodeRef.current!.textContent).toEqual(`status: ${EXITED}`);
        },

        onEntering() {
          count++;
          expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERING}`);
        },

        onEntered() {
          expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERED}`);
        },
      });

      await waitFor(() => {
        expect(count).toEqual(2);
      });
    });
  });

  describe('exiting', () => {
    it('should fire callbacks', async () => {
      let callOrder: string[] = [];
      let done = false;
      let onExit = jest.fn(() => callOrder.push('onExit'));
      let onExiting = jest.fn(() => callOrder.push('onExiting'));
      const nodeRef = React.createRef<HTMLDivElement>();

      const { setProps } = render(
        // @ts-ignore

        <Transition nodeRef={nodeRef} in timeout={10}>
          {status => <div ref={nodeRef}>status: {status}</div>}
        </Transition>,
      );

      expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERED}`);

      setProps({
        in: false,

        onExit,

        onExiting,

        onExited() {
          expect(onExit).toHaveBeenCalledTimes(1);
          expect(onExiting).toHaveBeenCalledTimes(1);
          expect(callOrder).toEqual(['onExit', 'onExiting']);
          done = true;
        },
      });

      await waitFor(() => {
        expect(done).toEqual(true);
      });
    });

    it('should move to each transition state', async () => {
      let count = 0;
      let done = false;
      const nodeRef = React.createRef<HTMLDivElement>();

      const { setProps } = render(
        // @ts-ignore

        <Transition nodeRef={nodeRef} in timeout={10}>
          {status => <div ref={nodeRef}>status: {status}</div>}
        </Transition>,
      );

      expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERED}`);

      setProps({
        in: false,

        onExit() {
          count++;
          expect(nodeRef.current!.textContent).toEqual(`status: ${ENTERED}`);
        },

        onExiting() {
          count++;
          expect(nodeRef.current!.textContent).toEqual(`status: ${EXITING}`);
        },

        onExited() {
          expect(nodeRef.current!.textContent).toEqual(`status: ${EXITED}`);
          expect(count).toEqual(2);
          done = true;
        },
      });

      await waitFor(() => {
        expect(done).toEqual(true);
      });
    });
  });

  describe('mountOnEnter', () => {
    interface MountTransitionProps {
      in: boolean;
      initialIn?: boolean;
      [key: string]: any;
    }

    const MountTransition: React.FC<MountTransitionProps> = ({
      in: inProp,
      initialIn,
      ...props
    }) => {
      const nodeRef = React.createRef<HTMLDivElement>();
      const [, setStatus] = useState<TransitionStatus>('unmounted');

      const handleStatusChange = (newStatus: TransitionStatus) => {
        setStatus(newStatus);
      };

      return (
        <Transition // @ts-ignore
          nodeRef={nodeRef}
          mountOnEnter
          in={inProp}
          timeout={10}
          {...props}
          onEntering={() => handleStatusChange('entering')}
          onEntered={() => handleStatusChange('entered')}
          onExiting={() => handleStatusChange('exiting')}
          onExited={() => handleStatusChange('exited')}
        >
          {currentStatus => <div ref={nodeRef}>status: {currentStatus}</div>}
        </Transition>
      );
    };

    it('should mount when entering', done => {
      const { container, setProps } = render(
        <MountTransition
          in={false}
          onEnter={() => {
            expect(container.textContent).toEqual(`status: ${EXITED}`);
            done();
          }}
        />,
      );

      expect(container.textContent).toEqual('');

      setProps({ in: true });
    });

    it('should stay mounted after exiting', async () => {
      let entered = false;
      let exited = false;
      const { container, setProps } = render(
        <MountTransition
          in={false}
          onEntered={() => {
            entered = true;
          }}
          onExited={() => {
            exited = true;
          }}
        />,
      );

      expect(container.textContent).toEqual('');
      setProps({ in: true });

      await waitFor(() => {
        expect(entered).toEqual(true);
      });
      expect(container.textContent).toEqual(`status: ${ENTERED}`);

      setProps({ in: false });

      await waitFor(() => {
        expect(exited).toEqual(true);
      });
      expect(container.textContent).toEqual(`status: ${EXITED}`);
    });
  });

  // describe('unmountOnExit', () => {
  //   interface UnmountTransitionProps {
  //     in: boolean;
  //     initialIn?: boolean;
  //     [key: string]: any;
  //   }

  //   const UnmountTransition: React.FC<UnmountTransitionProps> = ({ in: inProp, ...props }) => {
  //     const nodeRef = React.createRef<HTMLDivElement>();
  //     const [status, setStatus] = useState<TransitionStatus>('unmounted');

  //     const handleStatusChange = (newStatus: TransitionStatus) => {
  //       setStatus(newStatus);
  //     };

  //     return (
  //       <Transition
  //         nodeRef={nodeRef}
  //         unmountOnExit
  //         in={inProp}
  //         timeout={10}
  //         {...props}
  //         onEntering={() => handleStatusChange('entering')}
  //         onEntered={() => handleStatusChange('entered')}
  //         onExiting={() => handleStatusChange('exiting')}
  //         onExited={() => handleStatusChange('exited')}
  //       >
  //         <div ref={nodeRef} />
  //       </Transition>
  //     );
  //   };

  //   it('should mount when entering', async () => {
  //     let done = false;
  //     const instanceRef = useRef<HTMLDivElement>(null);

  //     const { setProps } = render(
  //       <UnmountTransition
  //         ref={instanceRef}
  //         in={false}
  //         onEnter={() => {
  //           expect(instanceRef.current!.getStatus()).toEqual(EXITED);
  //           expect(instanceRef.current!.nodeRef.current!).toExist();

  //           done = true;
  //         }}
  //       />,
  //     );

  //     expect(instanceRef.current.getStatus()).toEqual(UNMOUNTED);
  //     expect(instanceRef.current.nodeRef.current!).toBeNull();

  //     setProps({ in: true });

  //     await waitFor(() => {
  //       expect(done).toEqual(true);
  //     });
  //   });

  //   it('should unmount after exiting', async () => {
  //     let exited = false;
  //     const instanceRef = React.createRef();
  //     const { setProps } = render(
  //       <UnmountTransition
  //         ref={instanceRef}
  //         in
  //         onExited={() => {
  //           setTimeout(() => {
  //             exited = true;
  //           });
  //         }}
  //       />,
  //     );

  //     expect(instanceRef.current.getStatus()).toEqual(ENTERED);
  //     expect(instanceRef.current.nodeRef.current!).toExist();

  //     setProps({ in: false });

  //     await waitFor(() => {
  //       expect(exited).toEqual(true);
  //     });

  //     expect(instanceRef.current.getStatus()).toEqual(UNMOUNTED);
  //     expect(instanceRef.current.nodeRef.current!).not.toExist();
  //   });
  // });
});
