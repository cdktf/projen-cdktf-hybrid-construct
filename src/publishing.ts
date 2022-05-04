import { pascalCase } from "change-case";
import { ConstructLibraryOptions } from "projen/lib/cdk";

export type Registry = "npm" | "maven" | "nuget" | "pypi";

export type PublishOptions = {
  name: string;
  namespace: string;
  registries: Registry[];
};
type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

type Config = Mutable<
  Pick<
    ConstructLibraryOptions,
    "publishToPypi" | "publishToMaven" | "publishToNuget" | "releaseToNpm"
  >
>;

export function publishToRegistries(options: PublishOptions): Config {
  const { name, namespace, registries } = options;
  const sanitizedNamespace = namespace.replace(/-/gi, "_");
  const sanitizedName = name.replace(/-/gi, "_");
  const config: Config = {
    releaseToNpm: registries.includes("npm"),
  };

  if (registries.includes("pypi")) {
    config.publishToPypi = {
      distName: `${sanitizedNamespace}-${sanitizedName}`,
      module: `${sanitizedNamespace}_${sanitizedName}`,
    };
  }
  if (registries.includes("maven")) {
    config.publishToMaven = {
      javaPackage: `com.${sanitizedNamespace}.${sanitizedName}`,
      mavenGroupId: `com.${sanitizedNamespace}`,
      mavenArtifactId: sanitizedName,
    };
  }
  if (registries.includes("nuget")) {
    const nugetName = `${pascalCase(namespace)}.${pascalCase(name)}`;
    config.publishToNuget = {
      dotNetNamespace: nugetName,
      packageId: nugetName,
    };
  }
  return config;
}
