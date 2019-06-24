import { AxiosInstance } from 'axios';
import { IInterceptors, IRequestConfig } from '../specs/apiConfig';
import { IResponse } from '../specs/response';

export class Utils {
  public static addRequestInterceptors(
    request: AxiosInstance,
    interceptors?: ((config: IRequestConfig) => IRequestConfig)[]
  ) {
    if (!Array.isArray(interceptors)) {
      return;
    }
    interceptors.forEach(interceptor => request.interceptors.request.use(interceptor));
  }

  public static addResponseInterceptors(
    request: AxiosInstance,
    interceptors?: (((value: IResponse<any>) => IResponse<any> | Promise<IResponse<any>>) | undefined)[]
  ) {
    if (!Array.isArray(interceptors)) {
      return;
    }
    interceptors.forEach(interceptor => request.interceptors.response.use(interceptor as any));
  }

  public static addInterceptors(request: AxiosInstance, interceptors: Partial<IInterceptors>) {
    if (typeof interceptors !== 'object') {
      return;
    }
    Utils.addRequestInterceptors(request, interceptors.request);
    Utils.addResponseInterceptors(request, interceptors.response);
  }
}
