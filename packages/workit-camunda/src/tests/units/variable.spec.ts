import { IVariables, Variables } from '../../models/camunda/variables';

describe('Variables class', () => {
  it('should return undefined on non existing variable', () => {
    const vars: IVariables = new Variables();
    expect(vars.get('_meta')).toBeUndefined();
  });
});
