# FormData

FormData implementation for Node.js. Built over Readable stream and async generators.
Can be used to communicate between servers with multipart/form-data format.

[![Build Status](https://travis-ci.org/octet-stream/form-data.svg?branch=master)](https://travis-ci.org/octet-stream/form-data)
[![Code Coverage](https://codecov.io/github/octet-stream/form-data/coverage.svg?branch=master)](https://codecov.io/github/octet-stream/form-data?branch=master)
[![dependencies Status](https://david-dm.org/octet-stream/form-data/status.svg)](https://david-dm.org/octet-stream/form-data)
[![devDependencies Status](https://david-dm.org/octet-stream/form-data/dev-status.svg)](https://david-dm.org/octet-stream/form-data?type=dev)

## Installation

You can install this package from npm:

```
npm install formdata-node
```

Or with yarn:

```
yarn add formdata-node
```

## Usage

Each FormData instance allows you to read its data from `Readable` stream,
just use `FormData#stream` property for that.

You can send queries via HTTP clients that supports headers setting Readable stream as body.

Let's take a look at minimal example with [got](https://github.com/sindresorhus/got):

```js
import FormData from "formdata-node"
import got from "got"

const fd = new FormData()

fd.set("greeting", "Hello, World!")

const options = {
  body: fd.stream, // Set internal stream as request body
  headers: fd.headers // Set headers of the current FormData instance
}

got.post("http://example.com", options)
  .then(res => console.log("Res: ", res.body))
  .catch(err => console.error("Error: ", err))
```

## API

### `constructor FormData([entries])`

Initialize new FormData instance

  - **{array}** [entries = null] – an optional FormData initial entries.
    Each initial field should be passed as a collection of the objects
    with "name", "value" and "filename" props.
    See the [FormData#append()](#appendname-value-filename---void) for more info about the available format.

#### Instance properties

##### `get boundary() -> {string}`

Returns a boundary string of the current `FormData` instance.

##### `get stream() -> {stream.Readable}`

Returns an internal Readable stream. Use it to send queries, but don't push
anything into it.

##### `get headers() -> {object}`

Returns object with `content-type` header

#### Instance methods

##### `set(name, value[, filename]) -> {void}`

Set a new value for an existing key inside **FormData**,
or add the new field if it does not already exist.

  - **{string}** name – The name of the field whose data is contained in **value**
  - **{any}** value – The field value. You can pass any JavaScript primitive type (including `null` and `undefined`),
    [`Buffer`](https://nodejs.org/api/buffer.html#buffer_buffer), [`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable),
    [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
    Note that Arrays and Object will be converted to **string** by using **String** function.
    **You also need compatible polyfills or ponyfills to use ReadableStream, File and Blob as a field value**
  - **{string}** [filename = undefined] – A filename of given field. Can be added only for `Buffer` and `Readable` .

##### `append(name, value[, filename]) -> {void}`

Appends a new value onto an existing key inside a FormData object,
or adds the key if it does not already exist.

  - **{string}** name – The name of the field whose data is contained in **value**
  - **{any}** value – The field value. You can pass any JavaScript primitive type (including `null` and `undefined`),
    [`Buffer`](https://nodejs.org/api/buffer.html#buffer_buffer), [`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable),
    [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
    Note that Arrays and Object will be converted to **string** by using **String** function.
    **You also need compatible polyfills or ponyfills to use ReadableStream, File and Blob as a field value**
  - **{string}** [filename = undefined] – A filename of given field. Can be added only for `Buffer` and `Readable` .

##### `get(name) -> {string | Buffer | Readable | ReadStream | ReadableStream | Blob | file}`

Returns the first value associated with the given name.
**Buffer** and **Readable** values will be returned as-is.

  - **{string}** name – A name of the value you want to retrieve.

##### `getAll(name) -> {Array<string | Buffer | Readable | ReadStream | ReadableStream | Blob | file>}`

Returns all the values associated with a given key from within a **FormData** object.

  - **{string}** name – A name of the value you want to retrieve.

##### `has(name) -> {boolean}`

Check if a field with the given **name** exists inside **FormData**.

  - **{string}** – A name of the field you want to test for.

##### `delete(name) -> {void}`

Deletes a key and its value(s) from a `FormData` object.

  - **{string}** name – The name of the key you want to delete.

##### `getComputedLength() -> {Promise<number>}`

Returns computed length of the FormData content. If FormData instance contains
a field with stream.Readable value, this method will always return `undefined`.

##### `forEach(callback[, ctx]) -> {void}`

Executes a given **callback** for each field of the FormData instance

  - **{function}** callback – Function to execute for each element, taking three arguments:
    + **{any}** value – A value(s) of the current field.
    + **{string}** name – Name of the current field.
    + **{FormData}** fd – The FormData instance that **forEach** is being applied to
  - **{any}** [ctx = null] – Value to use as **this** context when executing the given **callback**

##### `keys() -> {IterableIterator<string>}`

Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** keys

##### `values() -> {IterableIterator<any>}`

Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** values

##### `entries() -> {IterableIterator<[string, any]>}`

Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the **FormData** key/value pairs

##### `[Symbol.iterator]() -> {IterableIterator<[string, any]>}`

An alias of [FormData#entries](#entries---iterator)

##### `[Symbol.asyncIterator]() -> {IterableIterator<Promise<Buffer>>}`

Returns an async iterator allowing to read a data from internal Readable stream using **for-await** syntax.
Read the [async iteration proposal](https://github.com/tc39/proposal-async-iteration) to get more info about async iterators.

## Related links

  - [`web-streams-polyfill`](https://github.com/MattiasBuelens/web-streams-polyfill) a Web Streams, based on the WHATWG spec reference implementation.
  - [`fetch-blob`](https://github.com/bitinn/fetch-blob) a Blob implementation on node.js, originally from node-fetch.
  - [`then-busboy`](https://github.com/octet-stream/then-busboy) is a promise-based wrapper around Busboy.
    Process multipart/form-data content and returns it as a single object.
    Will be helpful to handle your data on the server-side applications.
  - [`@octetstream/object-to-form-data`](https://github.com/octet-stream/object-to-form-data) converts JavaScript object to FormData.
  - [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface documentation on MDN
