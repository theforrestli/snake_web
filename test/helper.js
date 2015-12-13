
exports.hasKeys = (tn, obj, keys) => {
  tn.deepEqual(
    Object.keys(obj).sort(),
    keys.sort()
  );
}
