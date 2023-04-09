const ESC = '\u001b'

const detectKeyPressed = (key: Buffer): void => {
    if (key.toString() === ESC) {
        throw new Error('ESC detected')
    }
}

export function escHandler<This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
): (this: This, ...args: Args) => Return {
    const { kind } = context;
    
    if (kind === "method") {
        throw new Error('You\'re not supposed to call @escHandler on something different than a method')
    }

    process.stdin.setRawMode(true)
    process.stdin.on('data', detectKeyPressed)

    function escHandlerFn(this: This, ...args: Args): Return {
        const result = target.apply(this, args);

        process.stdin.setRawMode(false)
        process.stdin.removeListener('data', detectKeyPressed)

        return result;
    };

    return escHandlerFn
  }