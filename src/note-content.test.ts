import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanNoteContent,validateNoteFile} from './note-content.ts';
test('imported note links reject scripts and media cannot request remote URLs',()=>{
  const content=[{type:'image',props:{url:'https://tracking.example/image.png'}},{type:'image',props:{url:'local-file:abc-1'}},{content:[{type:'link',href:'javascript:alert(1)'},{type:'link',href:'https://example.com'}]}];
  const result=cleanNoteContent(content) as typeof content;
  assert.equal(result[0].props?.url,'');assert.equal(result[1].props?.url,'local-file:abc-1');
  assert.equal(result[2].content?.[0].href,'');assert.equal(result[2].content?.[1].href,'https://example.com/');
  assert.equal(content[0].props?.url,'https://tracking.example/image.png');
});
test('note attachment validation rejects disguised PDF/image bytes',async()=>{
  await assert.rejects(validateNoteFile(new File(['text'],'fake.pdf'),['pdf']),/content/);
  await assert.rejects(validateNoteFile(new File(['text'],'fake.png'),['png']),/content/);
  await assert.rejects(validateNoteFile(new File(['text'],'script.exe'),['pdf']),/allowed/);
  assert.equal(await validateNoteFile(new File(['%PDF-1.4\n'],'lecture.pdf'),['pdf']),'pdf');
});
