export default (value) => (
  value ? Reflect.construct(window.Date, [value]) : undefined
);
