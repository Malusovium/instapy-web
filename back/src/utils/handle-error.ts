export const handleError =
  (ctx: any) =>
    (err: any) =>
      ctx.body = { error: err.message }
