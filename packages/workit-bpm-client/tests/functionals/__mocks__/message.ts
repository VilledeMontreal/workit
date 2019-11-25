export const message = {
  _body: null,
  _properties: {},
  set body(value: any) {
    this._body = value;
  },
  get body(): any {
    return this._body;
  },
  set properties(value: any) {
    this._properties = value;
  },
  get properties(): any {
    return this._properties;
  }
};
