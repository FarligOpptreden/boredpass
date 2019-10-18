import config from "../../config";
import { BasicCrudPromises, RenderView, konsole } from "../../handlr";
import nodemailer from "nodemailer";

let mailTransport;

class Emails extends BasicCrudPromises {
  constructor() {
    super(config.connectionStrings.boredPass, "emails");
    mailTransport = nodemailer.createTransport(config.email);
  }

  send(args) {
    return new Promise((resolve, reject) =>
      RenderView(args.template.view, { props: args.template.props })
        .then(html =>
          mailTransport.sendMail({
            from: "BoredPass <no-reply@boredpass.com>",
            to: args.recipients.map(r => `${r.name} <${r.email}>`).join(";"),
            subject: args.subject,
            html: html
          })
        )
        .then(response => resolve(response))
        .catch(err => {
          konsole.error(err.toString());
          reject(err);
        })
    );
  }
}

export const EmailsService = new Emails();
