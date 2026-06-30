import { Card, CardContent, CardTitle } from '@fulltime/ui'

const VerificarPage = () => (
  <Card>
    <CardContent>
      <CardTitle>Verifique seu e-mail</CardTitle>
      <p className="mt-4 text-sm text-brand-navy/70">
        Enviamos um link de verificação para o seu endereço de e-mail. Acesse sua caixa de entrada e clique no link para ativar sua conta.
      </p>
      <div className="mt-6 text-sm text-brand-navy/70">
        <a href="/login" className="hover:underline">Voltar para o login</a>
      </div>
    </CardContent>
  </Card>
)

export default VerificarPage
