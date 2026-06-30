import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const VerificarPage = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">Verifique seu e-mail</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Enviamos um link de verificação para o seu endereço de e-mail. Acesse sua caixa de entrada e clique no link para ativar sua conta.
      </p>
      <div className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-foreground hover:underline">Voltar para o login</Link>
      </div>
    </CardContent>
  </Card>
)

export default VerificarPage
