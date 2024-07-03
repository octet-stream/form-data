/* eslint-disable no-undef */

import test from "ava"

import {expectType} from "ts-expect"
import type {BodyInit as NodeFetchBodyInit} from "node-fetch"

import {FormData} from "./FormData.js"
import {Blob} from "./Blob.js"
import {File} from "./File.js"

test("FormData is assignable to BodyInit", t => {
  expectType<BodyInit>(new FormData())

  t.pass()
})

test("FormData is assignable to node-fetch BodyInit", t => {
  expectType<NodeFetchBodyInit>(new FormData())

  t.pass()
})

test("Blob is assignable to BodyInit", t => {
  expectType<BodyInit>(new Blob())

  t.pass()
})

test("Blob is assignable to node-fetch BodyInit", t => {
  expectType<NodeFetchBodyInit>(new Blob())

  t.pass()
})

test("File is assignable to BodyInit", t => {
  expectType<BodyInit>(new File([], "test.txt"))

  t.pass()
})

test("File is assignable to node-fetch BodyInit", t => {
  expectType<NodeFetchBodyInit>(new File([], "test.txt"))

  t.pass()
})
