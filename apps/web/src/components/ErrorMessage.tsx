const ErrorMessage = ({ message }: { message: string }) => message ? (
  <div role="alert" className="text-danger-ink text-sm leading-6 bg-danger-subtle border border-danger/30 p-4 rounded-md mb-4">
    {message}
  </div>
) : null;

export default ErrorMessage;
