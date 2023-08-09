import { areUnique, arraysMatch, range, removeIf, repeat, unique } from "../src/index";

test("range", () => {
  expect(range(0, 4)).toStrictEqual([0, 1, 2, 3]);
  expect(range(2, 6)).toStrictEqual([2, 3, 4, 5]);
  expect(range(0, 0)).toStrictEqual([]);
  expect(range(0, 1)).toStrictEqual([0]);
});

test("repeat", () => {
  expect(repeat(2, 4)).toStrictEqual([2, 2, 2, 2]);
  expect(repeat("cat", 2)).toStrictEqual(["cat", "cat"]);
  expect(repeat("dog", 1)).toStrictEqual(["dog"]);
  expect(repeat("pizza", 0)).toStrictEqual([]);
});

test("unique (custom object)", () => {
  const obj = (a: string) => { return { x: a }; };
  const strEquals = (a: { x: string }, b: { x: string }) => a.x == b.x;

  expect(unique([obj("cat"), obj("dog"), obj("cat"), obj("cat")], strEquals))
    .toStrictEqual([obj("cat"), obj("dog")]);
  expect(unique([obj("dog"), obj("dog"), obj("cat"), obj("cat")], strEquals))
    .toStrictEqual([obj("dog"), obj("cat")]);
  expect(unique([obj("rat"), obj("dog"), obj("fat"), obj("cat")], strEquals))
    .toStrictEqual([obj("rat"), obj("dog"), obj("fat"), obj("cat")]);
  expect(unique([obj("rat"), obj("rat"), obj("rat")], strEquals))
    .toStrictEqual([obj("rat")]);
  expect(unique([obj("rat")], strEquals))
    .toStrictEqual([obj("rat")]);
  expect(unique([], strEquals))
    .toStrictEqual([]);
});

test("unique (primitive string)", () => {
  expect(unique(["cat", "dog", "cat", "cat"]))
    .toStrictEqual(["cat", "dog"]);
  expect(unique(["dog", "dog", "cat", "cat"]))
    .toStrictEqual(["dog", "cat"]);
  expect(unique(["rat", "dog", "fat", "cat"]))
    .toStrictEqual(["rat", "dog", "fat", "cat"]);
  expect(unique(["rat", "rat", "rat"]))
    .toStrictEqual(["rat"]);
  expect(unique(["rat"]))
    .toStrictEqual(["rat"]);
  expect(unique([]))
    .toStrictEqual([]);
});

test("areUnique (custom object)", () => {
  const obj = (a: string) => { return { x: a }; };
  const strEquals = (a: { x: string }, b: { x: string }) => a.x == b.x;

  expect(areUnique([obj("cat"), obj("dog"), obj("cat"), obj("cat")], strEquals))
    .toStrictEqual(false);
  expect(areUnique([obj("dog"), obj("dog"), obj("cat"), obj("cat")], strEquals))
    .toStrictEqual(false);
  expect(areUnique([obj("rat"), obj("dog"), obj("fat"), obj("cat")], strEquals))
    .toStrictEqual(true);
  expect(areUnique([obj("rat"), obj("rat"), obj("rat")], strEquals))
    .toStrictEqual(false);
  expect(areUnique([obj("rat")], strEquals))
    .toStrictEqual(true);
  expect(areUnique([], strEquals))
    .toStrictEqual(true);
});

test("areUnique (primitive string)", () => {
  expect(areUnique(["cat", "dog", "cat", "cat"]))
    .toStrictEqual(false);
  expect(areUnique(["dog", "dog", "cat", "cat"]))
    .toStrictEqual(false);
  expect(areUnique(["rat", "dog", "fat", "cat"]))
    .toStrictEqual(true);
  expect(areUnique(["rat", "rat", "rat"]))
    .toStrictEqual(false);
  expect(areUnique(["rat"]))
    .toStrictEqual(true);
  expect(areUnique([]))
    .toStrictEqual(true);
});

test("arraysMatch (custom object)", () => {
  const obj = (a: string) => { return { x: a }; };
  const strEquals = (a: { x: string }, b: { x: string }) => a.x == b.x;

  expect(arraysMatch(
    [obj("cat"), obj("dog")],
    [obj("cat"), obj("dog")],
    strEquals
  )).toStrictEqual(true);

  expect(arraysMatch(
    [obj("cat"), obj("dog")],
    [obj("dog"), obj("cat")],
    strEquals
  )).toStrictEqual(true);

  expect(arraysMatch(
    [obj("cat"), obj("dog")],
    [obj("dog"), obj("cat"), obj("cat")],
    strEquals
  )).toStrictEqual(true);

  expect(arraysMatch(
    [obj("cat"), obj("dog"), obj("dog")],
    [obj("dog"), obj("cat")],
    strEquals
  )).toStrictEqual(true);

  expect(arraysMatch(
    [obj("cat"), obj("frog"), obj("dog")],
    [obj("dog"), obj("cat")],
    strEquals
  )).toStrictEqual(false);

  expect(arraysMatch(
    [obj("cat"), obj("dog")],
    [obj("dog"), obj("cat"), obj("frog")],
    strEquals
  )).toStrictEqual(false);

  expect(arraysMatch(
    [],
    [],
    strEquals
  )).toStrictEqual(true);

  expect(arraysMatch(
    [obj("hello")],
    [],
    strEquals
  )).toStrictEqual(false);
});

test("arraysMatch (primitive string)", () => {
  expect(arraysMatch(
    ["cat", "dog"],
    ["cat", "dog"]
  )).toStrictEqual(true);

  expect(arraysMatch(
    ["cat", "dog"],
    ["dog", "cat"]
  )).toStrictEqual(true);

  expect(arraysMatch(
    ["cat", "dog"],
    ["dog", "cat", "cat"]
  )).toStrictEqual(true);

  expect(arraysMatch(
    ["cat", "dog", "dog"],
    ["dog", "cat"]
  )).toStrictEqual(true);

  expect(arraysMatch(
    ["cat", "frog", "dog"],
    ["dog", "cat"]
  )).toStrictEqual(false);

  expect(arraysMatch(
    ["cat", "dog"],
    ["dog", "cat", "frog"]
  )).toStrictEqual(false);

  expect(arraysMatch(
    [],
    []
  )).toStrictEqual(true);

  expect(arraysMatch(
    ["hello"],
    []
  )).toStrictEqual(false);
});

test("removeIf", () => {
  const array1 = ["bacon", "panda", "koala", "bicycle"];
  const modified1 = removeIf(array1, i => i.startsWith("b"));
  expect(array1).toStrictEqual(["panda", "koala"]);
  expect(modified1).toStrictEqual(true);

  const array2 = ["bacon", "panda", "koala", "bicycle"];
  const modified2 = removeIf(array2, i => i.startsWith("a"));
  expect(array2).toStrictEqual(["bacon", "panda", "koala", "bicycle"]);
  expect(modified2).toStrictEqual(false);
});
