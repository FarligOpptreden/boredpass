import { SecurityService } from "../services";
import { StringUtils } from "../utils";

export default class Authorization {
  static get(app) {
    app.all("*", async (req, _, next) => {
      if (/^\/content\/.*/.test(req.url)) return next();

      try {
        const r = await SecurityService.isAuthenticated({
          cookie: req.cookies.bp
        });
        req.authentication = {
          isAuthenticated: r ? true : false,
          user: r,
          utils: StringUtils
        };
      } catch (_) {
        req.authentication = {
          isAuthenticated: false,
          user: null,
          utils: StringUtils
        };
      } finally {
        next();
      }
    });
  }
}
