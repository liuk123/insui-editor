import { inject, Injectable } from "@angular/core";
import { InsAlertService } from "@liuk123/insui";


@Injectable({
  providedIn: "root"
})
export class MessageService {
  alertService = inject(InsAlertService)

  info(msg:string) {
    return this.alertService
      .open(msg, {
        appearance: 'info'
      })
  }
  success(msg:string) {
    return this.alertService
      .open(msg, {
        appearance: 'positive'
      })
  }
  warning(msg:string) {
    return this.alertService
      .open(msg, {
        appearance: 'warning'
      })
  }
  error(msg:string) {
    return this.alertService
      .open(msg, {
        appearance: 'negative'
      })
  }
  open(code: string, msg:string){
    return this.alertService
      .open(msg, {
        appearance: code
      })
  }
  
}