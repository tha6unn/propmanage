export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-propblue-light via-white to-white flex items-center justify-center p-4">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-propblue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet/5 rounded-full blur-3xl" />
      <div className="relative w-full max-w-[400px]">{children}</div>
    </div>
  );
}
