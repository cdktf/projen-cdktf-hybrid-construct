import { pascalCase } from "change-case";
import { ConstructLibraryOptions } from "projen/lib/cdk";

export type Registry = "npm" | "maven" | "nuget" | "pypi";

export type PublishOptions = {
  name: string;
  namespace: string;
  registries: Registry[];
};

type AtomicObject =
  | Function
  | Promise<any>
  | Date
  | RegExp
  | Boolean
  | Number
  | String;

type Mutable<T> = T extends AtomicObject
  ? T
  : T extends ReadonlyMap<infer K, infer V> // Map extends ReadonlyMap
  ? Map<Mutable<K>, Mutable<V>>
  : T extends ReadonlySet<infer V> // Set extends ReadonlySet
  ? Set<Mutable<V>>
  : T extends object
  ? { -readonly [K in keyof T]: Mutable<T[K]> }
  : T;

type Config = Mutable<
  Pick<
    ConstructLibraryOptions,
    | "publishToPypi"
    | "publishToMaven"
    | "publishToNuget"
    | "releaseToNpm"
    | "npmRegistryUrl"
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

export function publishToGithubPackages(options: PublishOptions): Config {
  const { registries } = options;
  const config = publishToRegistries(options);
  if (registries.includes("pypi")) {
    throw new Error("Github Packages does not support python packages");
  }
  if (registries.includes("nuget")) {
    // Seems like projen does not support github packages on nuget yet: https://github.dev/projen/projen/blob/14f37ec704afdc5143e6a2954c1250b1f0ccaddf/src/release/publisher.ts#L343
    throw new Error(
      "Github Packages does support nuget packages, but this library does not yet support it"
    );
  }

  if (registries.includes("npm")) {
    config.npmRegistryUrl = "npm.pkg.github.com";
  }

  if (registries.includes("maven")) {
    config.publishToMaven!.mavenRepositoryUrl = "https://maven.pkg.github.com";
  }

  return config;
}
