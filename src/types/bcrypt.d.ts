declare module "bcrypt" {
  export function hashSync(data: string, saltOrRounds: number): string;

  const bcrypt: {
    hashSync: typeof hashSync;
  };

  export default bcrypt;
}
