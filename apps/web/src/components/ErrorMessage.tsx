const ErrorMessage = ({ message }: { message: string }) => message ? (
  <div role="alert" className="text-red-500 text-sm bg-red-50 p-3 rounded mb-4">
    {message}
  </div>
) : null;

export default ErrorMessage;
