import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export class HttpClient {
  private instance: AxiosInstance;

  constructor(defaults?: AxiosRequestConfig) {
    this.instance = axios.create(defaults);
  }

  async get<T>(url: string, cfg?: AxiosRequestConfig) {
    return this.instance.get<T>(url, cfg);
  }

  async post<T>(url: string, data?: any, cfg?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, cfg);
  }

  async put<T>(url: string, data?: any, cfg?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, cfg);
  }

  // and other wrappers as needed
}

