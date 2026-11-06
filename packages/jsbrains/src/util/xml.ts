import {XMLParser, XMLValidator} from 'fast-xml-parser';
import {JetBrainsSettingsError} from '@/errors/errors';

export type XmlNode = Record<string, unknown>;

const parser = new XMLParser({
   ignoreAttributes: false,
   attributeNamePrefix: '@_',
   parseAttributeValue: false,
   parseTagValue: false,
   processEntities: true,
   trimValues: false
});

export function parseXml<T = unknown>(xml: string, path = '<XML input>'): T {
   // JetBrains settings never need DTDs. Reject them before entity expansion.
   if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
      throw new JetBrainsSettingsError(`DTD/entity declarations are unsupported in ${path}.`);
   }

   const validation = XMLValidator.validate(xml);

   if (validation !== true) {
      throw new JetBrainsSettingsError(
         `Invalid XML in ${path} near line ${validation.err.line}, column ${validation.err.col}.`
      );
   }

   try {
      return parser.parse(xml) as T;
   } catch {
      throw new JetBrainsSettingsError(`Cannot parse XML in ${path}.`);
   }
}

export function node(value: unknown): XmlNode {
   if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as XmlNode;
   }

   return {};
}

export function nodes(value: unknown): XmlNode[] {
   if (value === undefined || value === null) {
      return [];
   }

   if (Array.isArray(value)) {
      return value.map(node);
   }

   return [node(value)];
}

export function attribute(value: XmlNode, name: string): string | null {
   const result = value[`@_${name}`];
   return typeof result === 'string' ? result : null;
}

export function components(document: unknown): XmlNode[] {
   const root = node(document);
   return nodes(node(root.project ?? root.application).component);
}

export function component(document: unknown, name: string): XmlNode {
   return components(document).find(value => attribute(value, 'name') === name) ?? {};
}

export function option(value: XmlNode, name: string): string | null {
   const entry = nodes(value.option).find(item => attribute(item, 'name') === name);
   return attribute(entry ?? {}, 'value');
}
