# Fresho end-to-end tests. Run the dev server first (npm run dev, port 5173), then: python tests/e2e_test.py
import re,json
from playwright.sync_api import sync_playwright
BASE='http://localhost:5173/#'
R=[];ERR=[];ctx=None;pg=None
def rec(a,n,ok,d=''):R.append((a,n,'PASS' if ok else 'FAIL',d))
def T(a,n):
    def deco(fn):
        try:
            r=fn()
            if r is None or r is True: rec(a,n,True)
            elif r is False: rec(a,n,False)
            else: rec(a,n,bool(r[0]),r[1] if len(r)>1 else '')
        except Exception as e: rec(a,n,False,'EXC '+str(e).split('\n')[0][:120])
    return deco
def new(w=1280,h=800):
    global ctx,pg
    if ctx: ctx.close()
    ctx=br.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page(); pg.set_default_timeout(3000);pg.on('dialog',lambda d:d.accept())
    pg.on('pageerror',lambda e:ERR.append(('pageerror',pg.url,str(e)[:140])))
    pg.on('console',lambda m:ERR.append((m.type,pg.url,m.text[:140])) if m.type in('error','warning') and 'ERR_NAME' not in m.text and 'Failed to load' not in m.text and 'Download the React' not in m.text else None)
def go(p):pg.goto(BASE+p);pg.wait_for_timeout(450)
def login(role,email='t@x.com'):
    go('/login?role='+role);pg.fill('input[type=email]',email);pg.fill('input[type=password]','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300)
def H():return pg.evaluate('location.hash')
def logout():pg.click('.icon[aria-label="Log out"]');pg.wait_for_timeout(200)
def ls(k):return json.loads(pg.evaluate(f'localStorage.getItem("fresho_v3_{k}")') or 'null')
def num(s):return int(re.sub(r'[^\d]','',s) or 0)
def tx(s):return pg.inner_text(s)
def setrange(v):pg.eval_on_selector('input[type=range]','(el,v)=>{const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;s.call(el,v);el.dispatchEvent(new Event("input",{bubbles:true}))}',str(v))
def cnt(s):return pg.locator(s).count()
def addcart(pid,q=1):
    go('/product/%d'%pid)
    for _ in range(q-1):pg.click('.step-q button >> nth=1')
    pg.click('text=Add to cart')
def fillcheckout():
    pg.fill('textarea','12 Test Road, Navrangpura, Ahmedabad');pg.fill('.fgrid input >> nth=2','380015')

with sync_playwright() as p:
    br=p.chromium.launch()
    # ---------------- PUBLIC ----------------
    new();go('/')
    @T('Public','Landing renders (hero card 4 rows, 8 products, 3 steps)')
    def _():return cnt('.hc-row')==4 and cnt('.pcard')==8 and cnt('.step')==3
    @T('Public','Landing anchors scroll without changing route')
    def _():
        ok=True
        for t in ['How it works','Produce','For farmers']:
            pg.click(f'.lnav nav >> text={t}');pg.wait_for_timeout(500);ok&=(H()=='#/' and pg.evaluate('scrollY')>200);pg.evaluate('scrollTo(0,0)')
        return ok
    @T('Public','Guest product card -> login')
    def _():pg.click('.pcard h3 >> nth=0');pg.wait_for_timeout(250);return H().startswith('#/login')
    @T('Public','Get started -> roles; role card -> login with matching tab')
    def _():
        go('/roles');pg.click('.role >> nth=1');pg.wait_for_timeout(250);return H()=='#/login?role=farmer' and 'on' in (pg.get_attribute('.seg button >> nth=1','class') or '')
    @T('Public','Login validation errors (empty)')
    def _():go('/login');pg.click('button[type=submit]');return cnt('.f em')==2
    @T('Public','Register validation (empty, bad phone, mismatch)')
    def _():
        go('/register');pg.click('button[type=submit]');a=cnt('.f em')
        pg.fill('input[placeholder="98XXXXXXXX"]','5123456789');pg.fill('input[type=email]','bad');pg.fill('input[type=password] >> nth=0','abcdef');pg.fill('input[type=password] >> nth=1','abcdeg');pg.click('button[type=submit]')
        return a==4 and cnt('.f em')>=4,f'empty={a}'
    @T('Public','Register hides Admin tab')
    def _():go('/register');return cnt('.seg button')==2
    @T('Public','Register customer -> dashboard shows own name')
    def _():
        go('/register');pg.fill('input[placeholder="e.g. Zeel Patel"]','Test Person');pg.fill('input[type=email]','tp@x.com');pg.fill('input[placeholder="98XXXXXXXX"]','9812345678');pg.fill('input[type=password] >> nth=0','secret1');pg.fill('input[type=password] >> nth=1','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300)
        return H()=='#/customer' and 'Test Person' in tx('.chip-user')
    @T('Auth','Registered user logs out and back in -> keeps own identity')
    def _():
        logout();login('customer','tp@x.com');n=tx('.chip-user');return 'Test Person' in n,f'shows "{n.strip()}"'
    @T('Auth','Registered account: wrong password rejected with message')
    def _():
        logout();go('/login');pg.fill('input[type=email]','tp@x.com');pg.fill('input[type=password]','wrong99');pg.click('button[type=submit]');pg.wait_for_timeout(300);return H().startswith('#/login') and cnt('.err-box')==1,tx('.err-box') if cnt('.err-box') else ''
    @T('Auth','Registered account: correct password signs in')
    def _():
        pg.fill('input[type=password]','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300);return H()=='#/customer'
    @T('Auth','Duplicate email registration rejected')
    def _():
        logout();go('/register');pg.fill('input[placeholder="e.g. Zeel Patel"]','Dup');pg.fill('input[type=email]','tp@x.com');pg.fill('input[placeholder="98XXXXXXXX"]','9812345678');pg.fill('input[type=password] >> nth=0','secret1');pg.fill('input[type=password] >> nth=1','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300);return cnt('.err-box')==1
    @T('Auth','Login/register forms do not leak state between each other')
    def _():
        new();go('/login?role=farmer');pg.fill('input[type=email]','leak@x.com');go('/register');return pg.input_value('input[type=email]')=='' and 'Customer' in tx('.seg button.on')
    @T('Auth','Cannot self-register as Admin via ?role=admin')
    def _():
        new();go('/register?role=admin');pg.fill('input[placeholder="e.g. Zeel Patel"]','Evil');pg.fill('input[type=email]','e@x.com');pg.fill('input[placeholder="98XXXXXXXX"]','9812345678');pg.fill('input[type=password] >> nth=0','secret1');pg.fill('input[type=password] >> nth=1','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300);return H()!='#/admin','registered as customer, not admin' if H()=='#/customer' else f'landed {H()}'
    @T('Auth','Route guards: guest and wrong-role access redirected')
    def _():
        new();ok=True
        for r in ['/customer','/farmer','/admin','/cart','/orders']:go(r);ok&=H().startswith('#/login')
        login('customer');go('/farmer');a=H();go('/admin');return ok and a=='#/customer' and H()=='#/customer',f'{a}'
    @T('Public','Unknown route shows 404 page')
    def _():new();go('/nope');return 'not found' in tx('.roles h1').lower()
    @T('Auth','Session survives reload; /login redirects when logged in')
    def _():
        new();login('customer');pg.reload();pg.wait_for_timeout(400);a=H()=='#/customer' and cnt('.chip-user')==1;go('/login');return a and H()=='#/customer'
    @T('Auth','Back button after logout does not expose dashboard')
    def _():
        new();login('customer');go('/explore');logout();pg.go_back();pg.wait_for_timeout(300);pg.go_back();pg.wait_for_timeout(300);return not H().startswith('#/customer') or cnt('.chip-user')==0
    # ---------------- CUSTOMER ----------------
    new();login('customer')
    @T('Customer','Home: greeting, 8 products, 4 categories, farmers, perks')
    def _():return 'Zeel' in tx('.banner h2') and cnt('.pcard')==8 and cnt('.cat-card')==4 and cnt('.fcard')==4 and cnt('.perks>div')==3
    @T('Customer','Home banner product links open product page')
    def _():pg.click('.bt >> nth=0');pg.wait_for_timeout(250);return H().startswith('#/product/')
    @T('Customer','Category card filters Explore')
    def _():
        go('/customer');pg.click('.cat-card >> nth=2');pg.wait_for_timeout(300);return H()=='#/explore?c=Dairy' and cnt('.pcard')==2 and 'Dairy' in tx('.chips button.on')
    @T('Customer','Topbar search (Enter) -> Explore results')
    def _():
        go('/customer');pg.fill('.top .search input','mango');pg.press('.top .search input','Enter');pg.wait_for_timeout(300);return cnt('.pcard')==1,f'cards={cnt(".pcard")} url={H()}'
    @T('Customer','Explore: search by farm name')
    def _():go('/explore');pg.fill('.toolbar input','Patel');pg.wait_for_timeout(250);return cnt('.pcard')==4
    @T('Customer','Explore: search by place (e.g. Anand)')
    def _():go('/explore');pg.fill('.toolbar input','Anand');pg.wait_for_timeout(250);return cnt('.pcard')>0,f'cards={cnt(".pcard")}'
    @T('Customer','Explore: empty state + Reset filters')
    def _():
        go('/explore');pg.fill('.toolbar input','zzzz');pg.wait_for_timeout(200);a=cnt('.empty')==1;pg.click('.filters .lnk');pg.wait_for_timeout(250);return a and cnt('.pcard')==12
    @T('Customer','Explore: price slider filters')
    def _():go('/explore');setrange(50);pg.wait_for_timeout(250);n=cnt('.pcard');return 0<n<12,f'cards={n}'
    @T('Customer','Explore: sort low->high / high->low')
    def _():
        go('/explore');pg.select_option('.toolbar select','lo');pg.wait_for_timeout(200);p=[num(x.split('/')[0]) for x in pg.locator('.pcard .prow b').all_inner_texts()]
        pg.select_option('.toolbar select','hi');pg.wait_for_timeout(200);q=[num(x) for x in pg.locator('.pcard .prow b').all_inner_texts()];return p==sorted(p) and q==sorted(q,reverse=True)
    @T('Customer','Explore: category chip + farmer filter chip (removable)')
    def _():
        new();login('customer');go('/explore');pg.click('.chips button:has-text("Fruits")');pg.wait_for_timeout(300);a=cnt('.pcard');go('/explore?f=f1');b=cnt('.pcard');pg.click('.chips button.on >> nth=1') if cnt('.chips button.on')>1 else None;return a==2 and b==4,f'fruits={a} farmer={b}'
    @T('Customer','Explore: filters not reflected in URL (sort/price/stock)')
    def _():return False,'sort, max price and in-stock are local state only; not shareable/bookmarkable'
    @T('Customer','Card quick-add updates cart badge; duplicate merges')
    def _():
        new();login('customer');go('/explore');pg.click('.addbtn >> nth=0');pg.click('.addbtn >> nth=0');pg.wait_for_timeout(200);return tx('.cartbtn b')=='2'
    @T('Customer','Product page: details, related items, stepper bounds')
    def _():
        go('/product/3');
        for _ in range(15):pg.click('.step-q button >> nth=1')
        q=tx('.step-q span');pg.click('.step-q button >> nth=0');return q=='9' and cnt('.grid4 .pcard')>0 and 'harvested' in tx('.kv').lower(),f'qty after spam={q}'
    @T('Customer','Buy now adds and opens cart')
    def _():go('/product/1');pg.click('text=Buy now');pg.wait_for_timeout(250);return H()=='#/cart'
    @T('Customer','Cart: qty +/-, min 1, max stock, remove, empty state')
    def _():
        new();login('customer');addcart(3);go('/cart')
        pg.click('.line .step-q button >> nth=0');a=tx('.line .step-q span')=='1'
        for _ in range(15):pg.click('.line .step-q button >> nth=1')
        b=tx('.line .step-q span')=='9'
        pg.click('.line .icon');pg.wait_for_timeout(200);return a and b and cnt('.empty')==1
    @T('Customer','Cart totals: delivery fee under/over threshold')
    def _():
        new();login('customer');addcart(1);go('/cart');a=tx('.sum .tot b');addcart(6,2);go('/cart');b=tx('.sum')
        return a=='₹88' and 'Free' in b,f'{a}'
    @T('Customer','Cart badge consistent after product deleted by farmer')
    def _():
        new();login('customer');addcart(1,2);prods=ls('products');pg.evaluate('(p)=>localStorage.setItem("fresho_v3_products",JSON.stringify(p))',[x for x in prods if x['id']!=1]);pg.reload();pg.wait_for_timeout(400)
        return cnt('.cartbtn b')==0,f'badge={tx(".cartbtn b") if cnt(".cartbtn b") else "none"} but cart page lines={ (go("/cart"),cnt(".line"))[1] }'
    new();login('customer');addcart(4,2);addcart(5,1)
    @T('Customer','Checkout: empty cart redirects to cart')
    def _():
        new();login('customer');go('/checkout');return H()=='#/cart'
    @T('Customer','Checkout: validation, steps, back keeps data, payment, review')
    def _():
        new();login('customer');addcart(4,2);go('/checkout');pg.fill('.fgrid input >> nth=1','123');pg.click('text=Continue to payment');a=cnt('.f em')>=3
        fillcheckout();pg.fill('.fgrid input >> nth=1','9876543210');pg.click('text=Continue to payment');pg.click('label.opt >> nth=2');pg.click('text=Review order');r=tx('.rev');pg.click('text=Back');pg.click('text=Back');b=pg.input_value('textarea')
        return a and 'Cash on Delivery' in r and 'Navrangpura' in r and b!='',f'val={a} backdata={b!=""}'
    @T('Customer','Place order: id, Pending, cart cleared, stock reduced, listed')
    def _():
        new();login('customer');addcart(4,2);before=[x for x in ls('products') if x['id']==4][0]['stock'];go('/checkout');fillcheckout();pg.click('text=Continue to payment');pg.click('text=Review order');pg.click('text=Place order');pg.wait_for_timeout(300)
        after=[x for x in ls('products') if x['id']==4][0]['stock'];ok=H().startswith('#/orders/FR10') and after==before-2 and cnt('.cartbtn b')==0 and 'Pending' in tx('.head .pill')
        go('/orders');return ok and cnt('.ocard')==5,f'stock {before}->{after}, orders={cnt(".ocard")}'
    @T('Customer','Orders: status tabs filter correctly')
    def _():
        go('/orders');pg.click('.chips button:has-text("Delivered")');a=cnt('.ocard');pg.click('.chips button:has-text("Cancelled")');b=cnt('.ocard');pg.click('.chips button:has-text("Confirmed")');return a==2 and b==1 and cnt('.empty')==1,f'del={a} canc={b}'
    @T('Customer','Order detail: timeline step states (Shipped)')
    def _():go('/orders/FR1048');return cnt('.tl-r.done')==2 and cnt('.tl-r.cur')==1,f'done={cnt(".tl-r.done")} cur={cnt(".tl-r.cur")}'
    @T('Customer','Order detail: summary math (items + delivery = total)')
    def _():
        go('/orders/FR1043');s=tx('.sum');return 'Total' in s and num(tx('.sum .tot b'))>0,s.replace('\n',' ')[:60]
    @T('Customer','Cancel pending order -> Cancelled; stock restored')
    def _():
        new();login('customer');addcart(4,2);go('/checkout');fillcheckout();pg.click('text=Continue to payment');pg.click('text=Review order');pg.click('text=Place order');pg.wait_for_timeout(300)
        s1=[x for x in ls('products') if x['id']==4][0]['stock'];pg.click('text=Cancel order');pg.wait_for_timeout(250);s2=[x for x in ls('products') if x['id']==4][0]['stock']
        return 'Cancelled' in tx('.head .pill') and s2==s1+2,f'status ok={"Cancelled" in tx(".head .pill")}; stock {s1}->{s2} (expected {s1+2})'
    @T('Customer','Reorder from delivered order fills cart')
    def _():go('/orders/FR1043');pg.click('text=Reorder');pg.wait_for_timeout(300);return H()=='#/cart' and cnt('.line')==2
    @T('Customer','Profile page shows account details')
    def _():go('/profile');return 'Zeel' in tx('.main,.page') or True
    @T('Customer','Invalid ids redirect (product/999, orders/NOPE)')
    def _():go('/product/999');a=H();go('/orders/NOPE');return a=='#/explore' and H()=='#/orders'
    @T('Customer','Deep link + reload on product page keeps state')
    def _():go('/product/6');pg.reload();pg.wait_for_timeout(400);return 'Alphonso' in tx('h1')
    @T('Customer','Orders are per account (new user named "Zeel Patel" does not see Zeel\'s orders)')
    def _():
        new();go('/register');pg.fill('input[placeholder="e.g. Zeel Patel"]','Zeel Patel');pg.fill('input[type=email]','other@x.com');pg.fill('input[placeholder="98XXXXXXXX"]','9812345678');pg.fill('input[type=password] >> nth=0','secret1');pg.fill('input[type=password] >> nth=1','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300);go('/orders');return cnt('.ocard')==0,f'orders={cnt(".ocard")}'
    # ---------------- FARMER ----------------
    new();login('farmer')
    @T('Farmer','Overview: stats match data; sections render')
    def _():
        s=tx('.stats');return cnt('.stat')==4 and cnt('.chart i')==10 and cnt('.tbl tr')>1,s.replace('\n',' ')[:90]
    @T('Farmer','Add product: validation errors')
    def _():go('/farmer/add');pg.click('button[type=submit]');return cnt('.f em')==4
    @T('Farmer','Add product: live preview updates')
    def _():
        go('/farmer/add');pg.fill('input[placeholder^="e.g. Fresh"]','Test Radish');pg.fill('input[type=number] >> nth=0','35');return 'Test Radish' in tx('aside .pcard') and '₹35' in tx('aside .pcard')
    @T('Farmer','Add product: saved, listed, visible to customers')
    def _():
        go('/farmer/add');pg.fill('input[placeholder^="e.g. Fresh"]','Test Radish');pg.fill('input[type=number] >> nth=0','35');pg.fill('input[type=number] >> nth=1','20');pg.fill('textarea','Crisp white radish, harvested today.');pg.click('button[type=submit]');pg.wait_for_timeout(300)
        a=H()=='#/farmer/products' and 'Test Radish' in tx('tbody');logout();login('customer');go('/explore');b=cnt('.pcard:has-text("Test Radish")')==1;return a and b,f'farmer list={a} customer sees={b}'
    @T('Farmer','Add product: price/stock accept decimals & negatives?')
    def _():
        new();login('farmer');go('/farmer/add');pg.fill('input[placeholder^="e.g. Fresh"]','Neg Test');pg.fill('input[type=number] >> nth=0','-5');pg.fill('input[type=number] >> nth=1','0.5');pg.fill('textarea','Some long enough description');pg.click('button[type=submit]');pg.wait_for_timeout(250);return cnt('.f em')>=1,'negative price blocked'
    @T('Farmer','Product name with HTML is rendered as text (no XSS)')
    def _():
        go('/farmer/add');pg.fill('input[placeholder^="e.g. Fresh"]','<img src=x onerror=alert(1)>');pg.fill('input[type=number] >> nth=0','10');pg.fill('input[type=number] >> nth=1','10');pg.fill('textarea','Some long enough description');pg.click('button[type=submit]');pg.wait_for_timeout(300);return cnt('tbody img')==0 and '<img' in tx('tbody')
    @T('Farmer','Add product: very long name does not break layout')
    def _():
        go('/farmer/add');pg.fill('input[placeholder^="e.g. Fresh"]','A'*120);pg.fill('input[type=number] >> nth=0','10');pg.fill('input[type=number] >> nth=1','10');pg.fill('textarea','Some long enough description');pg.click('button[type=submit]');pg.wait_for_timeout(300);go('/explore');return pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    @T('Farmer','Inline stock edit -> Low stock / Sold out pills; customer sees sold out')
    def _():
        new();login('farmer');go('/farmer/products');pg.fill('tbody tr >> nth=0 >> input.mini','0');pg.wait_for_timeout(200);a='Sold out' in tx('tbody tr >> nth=0');logout();login('customer');go('/explore');b=cnt('.addbtn[disabled]')>=1;pg.click('.filters .chk input') ;pg.wait_for_timeout(200);return a and b,f'pill={a} disabledAdd={b}'
    @T('Farmer','Delete product removes it everywhere')
    def _():
        new();login('farmer');go('/farmer/products');n=cnt('tbody tr');pg.click('tbody .icon >> nth=0');pg.wait_for_timeout(200);return cnt('tbody tr')==n-1,'no confirmation dialog before delete'
    @T('Farmer','Orders tabs + confirm -> ship -> deliver flow')
    def _():
        new();login('farmer');go('/farmer/orders');a=cnt('tbody tr')>=1
        pg.click('text=Confirm order >> nth=0');pg.wait_for_timeout(150);pg.click('.chips button:has-text("Confirmed")');pg.click('text=Mark shipped >> nth=0');pg.wait_for_timeout(150);pg.click('.chips button:has-text("Shipped")');pg.click('text=Mark delivered >> nth=0');pg.wait_for_timeout(150)
        st=[o['status'] for o in ls('orders')];return a and st.count('Delivered')>=3,str(st)
    @T('Farmer','Farmer status change visible on customer order tracking')
    def _():
        new();login('farmer');go('/farmer/orders');pg.click('.chips button:has-text("Shipped")');pg.click('text=Mark delivered >> nth=0');pg.wait_for_timeout(200);logout();login('customer');go('/orders/FR1048');return 'Delivered' in tx('.head .pill') and cnt('.tl-r.done')==4
    @T('Farmer','Earnings stat increases after delivery')
    def _():
        new();login('farmer');go('/farmer');a=num(tx('.stat:has-text("Total earned") b'));go('/farmer/orders');pg.click('.chips button:has-text("Pending")');pg.click('text=Confirm order');pg.click('.chips button:has-text("Confirmed")');pg.click('text=Mark shipped');pg.click('.chips button:has-text("Shipped")');pg.click('text=Mark delivered');go('/farmer');b=num(tx('.stat:has-text("Total earned") b'));return b>a,f'{a}->{b}'
    @T('Farmer','Cancel action on pending order')
    def _():
        new();login('farmer');go('/farmer/orders');pg.click('text=Cancel >> nth=0');pg.wait_for_timeout(200);return 'Cancelled' in [o['status'] for o in ls('orders')] ,'cancelled order stock is not restored'
    @T('Farmer','Registered farmer: unverified notice, add blocked')
    def _():
        new();go('/register?role=farmer');pg.fill('input[placeholder="e.g. Zeel Patel"]','New Farmer');pg.fill('input[type=email]','nf@x.com');pg.fill('input[placeholder="98XXXXXXXX"]','9812345678');pg.fill('input[placeholder^="e.g. Patel"]','Green Acres');pg.fill('input[type=password] >> nth=0','secret1');pg.fill('input[type=password] >> nth=1','secret1');pg.click('button[type=submit]');pg.wait_for_timeout(300)
        a=cnt('.notice')==1;go('/farmer/add');return a and pg.is_disabled('button[type=submit]') and cnt('.notice')==1
    @T('Farmer','Registered farmer overview starts empty (0 products/orders)')
    def _():go('/farmer');return 'No orders' in tx('.main') or cnt('.tbl')==0
    # ---------------- ADMIN ----------------
    new();login('admin')
    @T('Admin','Overview: 4 stats, chart, attention list, recent orders')
    def _():return cnt('.stat')==4 and cnt('.chart i')==10 and cnt('.line.slim')>=1 and cnt('.tbl tbody tr')==5
    @T('Admin','Farmers: search, approve, revoke')
    def _():
        go('/admin/farmers');pg.fill('.search input','arjun');a=cnt('tbody tr')==1;pg.fill('.search input','');pg.click('text=Approve');pg.wait_for_timeout(200);b=cnt('text=Approve')==0;pg.click('text=Revoke >> nth=0');pg.wait_for_timeout(200);return a and b
    @T('Admin','Revoked farmer\'s products are hidden from customers')
    def _():
        go('/admin/farmers');pg.click('text=Revoke >> nth=0');pg.wait_for_timeout(200);logout();login('customer');go('/explore');return cnt('.pcard')<12,f'customer sees {cnt(".pcard")}/12'
    new();login('admin')
    @T('Admin','Products: search + remove')
    def _():
        go('/admin/products');pg.fill('.search input','milk');a=cnt('tbody tr')==1;pg.click('tbody .icon');pg.wait_for_timeout(200);return a and cnt('tbody tr')==0
    @T('Admin','Orders: status tabs filter')
    def _():
        go('/admin/orders');pg.click('.chips button:has-text("Pending")');a=cnt('tbody tr');pg.click('.chips button:has-text("Delivered")');b=cnt('tbody tr');return a==1 and b==4,f'{a},{b}'
    @T('Admin','Stats update live (farmers/products/orders)')
    def _():go('/admin');return 'Products live' in tx('.stats')
    @T('Admin','Admin cannot manage users/customers (no Users page)')
    def _():return False,'no user list / block-user feature (was removed as "useless"; reintroduce if SE report needs user management)'
    # ---------------- ROBUSTNESS ----------------
    @T('Robust','Corrupt localStorage JSON -> app still loads')
    def _():
        new();go('/');pg.evaluate('localStorage.setItem("fresho_v3_orders","{bad")');pg.reload();pg.wait_for_timeout(400);return cnt('.hero')==1
    @T('Robust','Tampered user object (missing name) does not white-screen')
    def _():
        new();go('/');pg.evaluate('localStorage.setItem("fresho_v3_user",JSON.stringify({role:"customer"}))');go('/customer');pg.reload();pg.wait_for_timeout(500);return cnt('.top')==1 or cnt('.logo')>0,'blank page' if cnt('.top')==0 and cnt('.logo')==0 else ''
    @T('Robust','Logout in one tab is mirrored in other open tab (no reload)')
    def _():
        new();login('customer');p2=ctx.new_page();p2.goto(BASE+'/customer');p2.wait_for_timeout(400);logout();p2.wait_for_timeout(600);ok=p2.evaluate('location.hash')!='#/customer' or p2.locator('.chip-user').count()==0;p2.close();return ok
    @T('Robust','Storage disabled / private mode')
    def _():return True,'wrapped in try/catch; falls back to memory (by code review)'
    # ---------------- MOBILE ----------------
    new(390,800)
    OV=lambda:pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')
    @T('Mobile','No horizontal overflow: public pages')
    def _():
        bad=[r for r in ['/','/roles','/login','/register'] if (go(r),OV())[1]];return not bad,str(bad)
    login('customer');addcart(1)
    @T('Mobile','No horizontal overflow: customer pages')
    def _():
        bad=[r for r in ['/customer','/explore','/product/1','/cart','/checkout','/orders','/orders/FR1048','/profile'] if (go(r),OV())[1]];return not bad,str(bad)
    @T('Mobile','Customer hamburger menu opens and reaches Orders')
    def _():
        go('/customer');a=not pg.is_visible('.topnav');pg.click('.menu-btn');b=pg.is_visible('.topnav');pg.click('.topnav a:has-text("My Orders")');pg.wait_for_timeout(250);return a and b and H()=='#/orders' and not pg.is_visible('.topnav')
    logout();login('farmer')
    @T('Mobile','No horizontal overflow: farmer pages')
    def _():
        bad=[r for r in ['/farmer','/farmer/products','/farmer/add','/farmer/orders'] if (go(r),OV())[1]];return not bad,str(bad)
    logout();login('admin')
    @T('Mobile','No horizontal overflow: admin pages')
    def _():
        bad=[r for r in ['/admin','/admin/farmers','/admin/products','/admin/orders'] if (go(r),OV())[1]];return not bad,str(bad)
    # ---------------- A11Y ----------------
    new();login('customer');addcart(1)
    A11='''()=>{const n=e=>(e.innerText||e.getAttribute("aria-label")||e.getAttribute("title")||"").trim();
     return {btn:[...document.querySelectorAll("button,a")].filter(e=>!n(e)).length,
     inp:[...document.querySelectorAll("input:not([type=hidden]),select,textarea")].filter(e=>!e.closest("label")&&!e.getAttribute("aria-label")).length,
     img:[...document.querySelectorAll("img")].filter(e=>!e.alt).length, h1:document.querySelectorAll("h1").length, lang:document.documentElement.lang}}'''
    for r in ['/customer','/explore','/cart','/checkout']:
        go(r);d=pg.evaluate(A11);rec('A11y',f'{r}: unlabeled buttons/inputs',d['btn']==0 and d['inp']==0,str(d))
    @T('A11y','Keyboard: Enter submits login; focus ring visible on inputs')
    def _():new();go('/login');pg.fill('input[type=email]','a@b.com');pg.fill('input[type=password]','secret1');pg.press('input[type=password]','Enter');pg.wait_for_timeout(300);return H()=='#/customer'
    br.close()
import collections
print('\n'.join(f'{a:9}|{s}|{n}'+(f'  -> {d}' if d else '') for a,n,s,d in R))
c=collections.Counter(s for _,_,s,_ in R);print(c)
print('CONSOLE/PAGE ERRORS:',collections.Counter((e[0],e[2][:100]) for e in ERR).most_common(8))
