export class Person {

  display: boolean = false;

  static deserialize(jsonData): Person[] {
    if (!jsonData) {
      return [];
    }

    let len = jsonData.length;
    let result: Person[] = [];
    for (let i = 0; i < len; i++) {
      result.push(new Person(
        jsonData[i].name,
        jsonData[i].roll,
        jsonData[i].dept,
        jsonData[i].image
      ));
    }
    return result;
  }

  constructor(public name: string,
              public roll: string,
              public dept: string,
              public image: string) {
    this.name = name;
  };
}
