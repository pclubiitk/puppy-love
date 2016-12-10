export class Config {
  static baseUrl: string = '/api';
  static loginUrl: string = Config.baseUrl + '/session/login';
  static logoutUrl: string = Config.baseUrl + '/session/logout';
  static loginDataUrl: string = Config.baseUrl + '/users/login/info';
  static loginFirstUrl: string = Config.baseUrl + '/users/login/first';
  static loginMailUrl: string = Config.baseUrl + '/users/mail/';
}
