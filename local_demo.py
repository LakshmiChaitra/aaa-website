"""Isolated local demo: submissions stay in memory; never contact Google Forms."""
import production_app as site

records = {}

def demo_store(command):
    operation, key, *args = command
    if operation == 'GET':
        return records.get(key)
    if operation == 'SET':
        if 'NX' in args and key in records:
            return None
        records[key] = args[0]
        return 'OK'
    if operation == 'INCR':
        return 0
    raise ValueError('Unsupported demo command')

site.redis_command = demo_store
site.submit_google_registration = lambda data, reference: None

@site.app.after_request
def show_demo_notice(response):
    if response.mimetype == 'text/html' and response.status_code == 200:
        response.direct_passthrough = False
        response.set_data(response.get_data(as_text=True).replace('<head>', '<head><script>window.AAA_LOCAL_DEMO=true;</script>').replace('<body class="contemporary">', '<body class="contemporary local-demo"><div class="local-demo-banner">Local demo · sample submissions only · nothing is saved to the live registration Sheet.</div><script>new ResizeObserver(entries=>{let h=entries[0].target.offsetHeight;document.documentElement.style.setProperty("--demo-banner-height",h+"px");document.documentElement.style.scrollPaddingTop=h+"px";}).observe(document.querySelector(".local-demo-banner"));</script>'))
        response.headers['Cache-Control'] = 'no-store'
    return response

if __name__ == '__main__':
    site.app.run(host='127.0.0.1', port=4190)
