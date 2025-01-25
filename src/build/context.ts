const html = ['content-type', 'text/html'];
const json = ['content-type', 'application/json'];

export default class GenericContext {
  // @ts-expect-error Assign later
  public status: number;
  public headers: [string, string][];
  public req: Request;

  public constructor(req: Request) {
    this.req = req;
    this.headers = [];
  }

  public body(body: any, status: any): Response {
    if (typeof status === 'number')
      this.status = status;
    return new Response(body, this);
  }

  public html(body: any, status: any): Response {
    this.headers.push(<[string, string]>html);
    if (typeof status === 'number')
      this.status = status;
    return new Response(body, this);
  }

  public json(body: any, status: any): Response {
    this.headers.push(<[string, string]>json);
    if (typeof status === 'number')
      this.status = status;
    return new Response(JSON.stringify(body), this);
  }
}
