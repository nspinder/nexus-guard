// Emergency debug script to find correct WhatsApp Web selectors
// Paste this in the console on web.whatsapp.com to find the right DOM structure

console.log('=== WhatsApp Web DOM Inspector ===');
console.log('');

// Check common container selectors
const selectors = [
  '[role="main"]',
  '[data-testid="pane-side"]',
  'main',
  '.two',
  '.eqrjh0',
  'div[class*="pane"]',
  'div[class*="main"]',
  'div[contenteditable="false"]',
  'span[data-testid*="conversation"]',
  'div[data-testid="pane"]',
  'div[class*="message"]',
  '[role="region"]',
  '[role="application"]',
  '.app-wrapper-web',
  '#pane-side'
];

console.log('Testing selectors:');
selectors.forEach(sel => {
  const el = document.querySelector(sel);
  console.log(`${sel.padEnd(40)} → ${el ? '✓ FOUND' : '✗ not found'}`);
  if (el) {
    console.log(`  └─ tagName: ${el.tagName}, class: ${el.className.substring(0, 50)}`);
  }
});

console.log('');
console.log('=== All main container candidates ===');
// Find all elements with large class names that might be containers
const candidates = document.querySelectorAll('[class]');
const largeClasses = Array.from(candidates)
  .filter(el => el.className.length > 20)
  .filter(el => el.children.length > 5)
  .slice(0, 10);

largeClasses.forEach((el, i) => {
  console.log(`${i+1}. <${el.tagName}> class="${el.className.substring(0, 60)}..." (children: ${el.children.length})`);
});

console.log('');
console.log('=== Message elements ===');
const messageSelectors = [
  '[data-testid*="message"]',
  '[data-testid*="msg"]',
  '[role="article"]',
  '[role="row"]',
  'div[class*="message"]',
  'div[class*="bubble"]',
  'span[class*="selectable"]'
];

messageSelectors.forEach(sel => {
  const els = document.querySelectorAll(sel);
  console.log(`${sel.padEnd(40)} → ${els.length} elements`);
  if (els.length > 0) {
    console.log(`  └─ First: <${els[0].tagName}> "${els[0].innerText?.substring(0, 30)}"`);
  }
});

console.log('');
console.log('=== Page structure ===');
console.log('document.body children:', document.body.children.length);
console.log('document.documentElement classList:', Array.from(document.documentElement.classList).join(', '));
console.log('');
console.log('Once you find a working selector above, update content.js');
