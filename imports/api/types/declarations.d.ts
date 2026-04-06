declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "bootstrap/dist/css/bootstrap.min.css" {
  const content: string;
  export default content;
}
