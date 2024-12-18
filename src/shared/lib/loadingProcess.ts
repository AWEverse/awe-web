interface LoadingProps {
  pending?: number;
}

const withAsync = (props: LoadingProps): Promise<void> => {
  const { pending = 2000 } = props;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve();
      } else {
        reject(new Error('Something went wrong'));
      }
    }, pending);
  });
};

export default withAsync;
