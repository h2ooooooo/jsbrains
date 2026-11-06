export function parseInstallationName(name: string) {
   const match = /^(.+?)(\d{4}\.\d+(?:\.\d+)*(?:[-.\w]*))$/.exec(name);
   return {product: match?.[1] ?? name, version: match?.[2] ?? null};
}

export function compareJetBrainsVersions(left: string | null, right: string | null): number {
   if (left === right) {
      return 0;
   }

   if (left === null) {
      return -1;
   }

   if (right === null) {
      return 1;
   }

   const leftParts = left.match(/^\d+(?:\.\d+)*/)?.[0].split('.').map(Number) ?? [];
   const rightParts = right.match(/^\d+(?:\.\d+)*/)?.[0].split('.').map(Number) ?? [];

   for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
      const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);

      if (difference !== 0) {
         return difference;
      }
   }

   const leftSuffix = left.replace(/^\d+(?:\.\d+)*/, '');
   const rightSuffix = right.replace(/^\d+(?:\.\d+)*/, '');

   if (leftSuffix === rightSuffix) {
      return 0;
   }

   if (!leftSuffix) {
      return 1;
   }

   if (!rightSuffix) {
      return -1;
   }

   return leftSuffix.localeCompare(rightSuffix, 'en', {numeric: true});
}
