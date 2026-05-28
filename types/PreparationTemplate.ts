

export interface PreparationTemplate {
    _id?: string,
    name : string,
    checklist : Array<checklist>
}

export interface checklist {
    title : string,
    order : number | string,
}

// what your API actually returns
export interface ApiResponse<T> {
  message: string
  data: T
}