export function deepEqual(oldData: any, newData: any): boolean {
  if (oldData === newData) return true;

  const oldDataString = JSON.stringify(oldData);
  const newDataString = JSON.stringify(newData);

  if (oldDataString === newDataString) return true;

  const oldDataOBJ = oldDataString ? JSON.parse(oldDataString) : null;
  const newDataOBJ = newDataString ? JSON.parse(newDataString) : null;

  if (typeof oldDataOBJ === 'string' && typeof newDataOBJ === 'string') {
    return oldDataOBJ === newDataOBJ;
  }

  if (
    typeof oldDataOBJ === 'object'
    && typeof newDataOBJ === 'object'
    && oldDataOBJ
    && '_id' in oldDataOBJ
    && newDataOBJ
    && '_id' in newDataOBJ
  ) {
    const keys = Object.keys(newDataOBJ);

    const hasChanges = keys.every(
      key => key === '_id' || oldDataOBJ[key] === newDataOBJ[key],
    );

    return hasChanges;
  }

  if (Array.isArray(oldDataOBJ) && Array.isArray(newDataOBJ)) {
    if (oldDataOBJ?.length !== newDataOBJ?.length) {
      return false;
    }

    return newDataOBJ.every(newDataValue => oldDataOBJ.some(oldDataValue => {
      if (
        typeof oldDataValue === 'object'
          && oldDataValue !== null
          && typeof newDataValue === 'object'
          && newDataValue !== null
      ) {
        const newKeys = Object.keys(newDataValue);
        const oldKeys = Object.keys(oldDataValue);

        return (
          newKeys.every(
            key => key === '_id' || newDataValue[key] === oldDataValue[key],
          )
            && oldKeys.every(
              key => key === '_id' || newDataValue[key] === oldDataValue[key],
            )
        );
      }
      return false;
    }));
  }

  return false;
}
