export class Config {
  static baseUrl: string = '/api';
  static loginUrl: string = Config.baseUrl + '/session/login';
  static logoutUrl: string = Config.baseUrl + '/session/logout';
  static loginDataUrl: string = Config.baseUrl + '/users/data/info';
  static loginFirstUrl: string = Config.baseUrl + '/users/login/first';
  static loginMailUrl: string = Config.baseUrl + '/users/mail/';
  static dataSaveUrl: string = Config.baseUrl + '/users/data/update';

  static listGender: string = Config.baseUrl + '/list/gender';
  static listPubkey: string = Config.baseUrl + '/list/pubkey';
  static listCompute: string = Config.baseUrl + '/list/compute';
}
