# Migrations

O schema do banco é controlado por migrations do TypeORM (`synchronize: false`). Nunca altere tabelas
diretamente no banco nem ligue o `synchronize`: toda mudança de schema entra como uma migration.

## Estrutura

| Arquivo                | Função                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `database.module.ts`   | Configura o `ConfigModule` e o `TypeOrmModule` usados pela aplicação |
| `data-source.ts`       | `AppDataSource`, usado só pela CLI do TypeORM (lê o `.env`)         |
| `migrations/`          | Arquivos de migration, executados em ordem pelo timestamp do nome   |

As entidades são descobertas pelo glob `**/*.entity{.ts,.js}`, então os arquivos de entidade devem
terminar em `.entity.ts`.

## Pré-requisitos

- Postgres acessível.
- `.env` com `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE`.

## Scripts

| Script                       | O que faz                                                         |
| ---------------------------- | ----------------------------------------------------------------- |
| `npm run migration:create`   | Cria uma migration **vazia** para você escrever o `up`/`down`     |
| `npm run migration:generate` | Gera uma migration comparando as entidades com o banco atual      |
| `npm run migration:run`      | Executa as migrations pendentes                                   |
| `npm run migration:revert`   | Desfaz a **última** migration executada                           |
| `npm run migration:show`     | Lista as migrations e indica quais já foram executadas            |
| `npm run typeorm -- <cmd>`   | Atalho para a CLI do TypeORM (`typeorm-ts-node-commonjs`)         |

`create` e `generate` exigem o caminho (sem extensão) da migration. Passe depois do `--`:

```bash
npm run migration:create -- src/database/migrations/CreateUsers
npm run migration:generate -- src/database/migrations/CreateUsers
```

O TypeORM prefixa o nome com o timestamp (`1730000000000-CreateUsers.ts`).

## Fluxo de trabalho

1. Crie ou altere a entidade (`*.entity.ts`).
2. Gere a migration: `npm run migration:generate -- src/database/migrations/NomeDaMudanca`.
3. **Revise o arquivo gerado**: confira o `up` e o `down` antes de executar.
4. Execute: `npm run migration:run`.
5. Versione a migration junto com a entidade.

Use `migration:create` quando a mudança não vem de uma entidade (dados iniciais, índices, SQL
manual).

## Regras

- Não edite uma migration que já foi executada em outro ambiente; crie uma nova.
- Sempre implemente o `down` para que o `migration:revert` funcione.
- `migration:generate` só detecta diferenças em entidades que estão carregadas. Se nada for gerado,
  confira se o arquivo termina em `.entity.ts`.
- Em produção, rode `migration:run` no deploy antes de subir a aplicação.
