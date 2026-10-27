const APP_NAME = 'Pizza App'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const passwordResetTemplate = (resetLink: string) => {
  const link = escapeHtml(resetLink)

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redefinição de senha</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f1ee">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 32px 16px">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="max-width: 560px; background-color: #ffffff; border-radius: 8px; overflow: hidden"
          >
            <tr>
              <td
                align="center"
                style="
                  background-color: #c0392b;
                  padding: 24px 32px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 22px;
                  font-weight: bold;
                  color: #ffffff;
                "
              >
                ${APP_NAME}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 32px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 16px;
                  line-height: 24px;
                  color: #333333;
                "
              >
                <h1 style="margin: 0 0 16px; font-size: 22px; line-height: 28px; color: #222222">
                  Redefinição de senha
                </h1>
                <p style="margin: 0 0 24px">
                  Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo
                  para escolher uma nova senha. O link vale por 1 hora.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                  <tr>
                    <td align="center" style="background-color: #c0392b; border-radius: 6px">
                      <a
                        href="${link}"
                        target="_blank"
                        style="
                          display: inline-block;
                          padding: 14px 32px;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 16px;
                          font-weight: bold;
                          color: #ffffff;
                          text-decoration: none;
                        "
                      >
                        Redefinir minha senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 24px 0 8px; font-size: 14px; line-height: 20px; color: #666666">
                  Se o botão não funcionar, copie e cole este endereço no navegador:
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 20px; word-break: break-all">
                  <a href="${link}" target="_blank" style="color: #c0392b">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 16px 32px 32px;
                  border-top: 1px solid #eeeeee;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 12px;
                  line-height: 18px;
                  color: #999999;
                "
              >
                Se você não pediu a redefinição, ignore este e-mail. Sua senha continua a mesma.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
