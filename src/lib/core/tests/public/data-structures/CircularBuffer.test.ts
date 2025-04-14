import { CircularBuffer } from "@/lib/core/public/data-structures";

test("CircularBuffer overwrites and preserves order", () => {
  const buf = new CircularBuffer<number>(3);

  buf.write(1);
  buf.write(2);
  buf.write(3);
  expect(buf.readAll()).toEqual([1, 2, 3]);

  buf.write(4);
  expect(buf.readAll()).toEqual([2, 3, 4]);

  buf.write(5);
  buf.write(6);
  expect(buf.readAll()).toEqual([4, 5, 6]);
});
