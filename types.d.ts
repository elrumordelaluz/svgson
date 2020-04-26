declare module "svgson" {
  export interface ISvgObject {
    name: string,
    type: string,
    value: string,
    attributes: Record<string, string>,
    children: ISvgObject[]
  }

  function parse(content: string): Promise<ISvgObject>;

  function stringify(object: ISvgObject): string;
}
