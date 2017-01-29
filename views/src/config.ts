export class Config {
  static baseUrl: string = '/api';
  static loginUrl: string = Config.baseUrl + '/session/login';
  static logoutUrl: string = Config.baseUrl + '/session/logout';
  static loginDataUrl: string = Config.baseUrl + '/users/data/info';
  static loginFirstUrl: string = Config.baseUrl + '/users/login/first';
  static loginMailUrl: string = Config.baseUrl + '/users/mail/';
  static dataSaveUrl: string = Config.baseUrl + '/users/data/update';
  static submitSaveUrl: string = Config.baseUrl + '/users/data/submit';

  static listGender: string = Config.baseUrl + '/list/gender';
  static listPubkey: string = Config.baseUrl + '/list/pubkey';
  static listCompute: string = Config.baseUrl + '/list/compute';

  static computeToken: string = Config.baseUrl + '/compute/token';
  static computeRes: string = Config.baseUrl + '/compute/result';
  static computeValue: string = Config.baseUrl + '/compute/value';

  static declareChoices: string = Config.baseUrl + '/declare/choices';

  static voteGet: string = Config.baseUrl + '/votes/get';
  static voteSend: string = Config.baseUrl + '/votes/send';
}
