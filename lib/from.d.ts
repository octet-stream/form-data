declare module "fetch-blob/from.js" {
  import Blob from "fetch-blob"

  export default function fromPath(path: string): Blob
}
