0.8.1 / 2016-06-02
==================
- [CHANGE] NO MORE `this.body = ''` for OPTIONS.

0.8.0 / 2016-02-02
==================
- [UPDATE] update all dependencies.
- [FIX] koa-router 5.x problems.

0.7.13 / 2016-01-22
==================
- [UPDATE] update all dependencies

0.7.12 / 2015-06-08
==================
- [FIX] update koa-ovenware to v0.2.0 to fix the windows issues.

0.7.11 / 2015-03-24
==================
- [ENHANCE] use koa-router OPTIONS handler to set Allow value.
- [FIX] koa-router 4.x problems.

0.7.10 / 2015-02-25
==================
- [FIX] some stupid bugs.

0.7.8 / 2015-02-09
==================
- [ADD] add Access-Control headers for crossing domain automatically.

0.7.7 / 2015-02-03
==================
- [ENHANCE] new code structure (use koa-ovenware for auto loading).
- [ADD] prefix could be a RegExp.
- [FIX] default format setting will really available by default (when there's no Accept head).
- [FIX] some bugs.

0.7.6 / 2014-12-10
==================
- [FIX] custom HTTP code

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