import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Vendedor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crea tu cuenta para acceder al sistema
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Después del registro, el administrador debe activar tu perfil
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
