import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validReport,recordDiagnostic,diagnosticEvents,type SupportReport} from './support-data.ts';
const report:SupportReport={kind:'bug',subject:'Example',message:'Example report for testing.',requestId:'12345678-1234-1234-1234-123456789abc',screenshot:null,diagnostics:{view:'courses',language:'en',width:390,height:844,events:[]}};
test('reports enforce bounds and reject non-PNG or contact attachments',()=>{
 assert.equal(validReport(report),true);
 assert.equal(validReport({...report,message:'short'}),false);
 assert.equal(validReport({...report,subject:'a'.repeat(121)}),false);
 assert.equal(validReport({...report,screenshot:'data:image/svg+xml;base64,AAAA'}),false);
 assert.equal(validReport({...report,screenshot:'data:image/png;base64,AAAA'}),false);
 assert.equal(validReport({...report,kind:'complaint'}),false);
 assert.equal(validReport({...report,diagnostics:{...report.diagnostics!,view:'email@example.com'}}),false);
});
test('diagnostic buffer keeps only bounded event codes and timestamps',()=>{
 for(let i=0;i<30;i++)recordDiagnostic('CLIENT_ERROR');
 const events=diagnosticEvents();assert.equal(events.length,20);assert.deepEqual(Object.keys(events[0]),['code','time']);events.pop();assert.equal(diagnosticEvents().length,20);
});
