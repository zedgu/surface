0.7.5 / 2014-10-16
==================
- [FIX] del route - `DELETE`
- [FIX] about https://github.com/koajs/koa/pull/353

0.7.4 / 2014-10-02
==================

- [REMOVE] No longer support `ctx.body = ''` => 204 No Content
  - use `ctx.body = null` instead
- [REMOVE] API - this.statusMessage
  - use `ctx.res.statusCode` and `ctx.res.statusMessage` (node native API) instead

0.7.3 / 2014-09-25
==================

- [ADD] default prefixPattern = new RegExp(prefix), if prefix is string.

0.7.2 / 2014-09-25
==================

- [ADD] API - this.statusMessage

0.7.1 / 2014-09-24
==================

- [ADD] prefix for all routes
- [FIX] #1