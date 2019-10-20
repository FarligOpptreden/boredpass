import config from "../../config";
import { BasicCrudPromises, RenderView, konsole } from "../../handlr";
import nodemailer from "nodemailer";

let mailTransport;

class Emails extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "emails");
    mailTransport = nodemailer.createTransport(config.email);
  }

  /**
   * Send an email.
   * @param {*} args
   * @param {*} args.recipients
   * @param {*} args.subject
   * @param {*} args.template
   * @param {*} args.template.view
   * @param {*} args.template.props
   */
  async send(args) {
    try {
      const html = await RenderView(args.template.view, {
        props: args.template.props
      });
      const response = await mailTransport.sendMail({
        from: "BoredPass <no-reply@boredpass.com>",
        to: args.recipients.map(r => `${r.name} <${r.email}>`).join(";"),
        subject: args.subject,
        html: html
      });

      return response;
    } catch (err) {
      konsole.error(err.toString());
      throw err;
    }
  }
}

export const EmailsService = new Emails();
