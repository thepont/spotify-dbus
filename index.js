const {Subject} = require('rxjs');
const {share, map, distinctUntilChanged} = require('rxjs/operators');
const dbus = require('dbus-next');
const bus = dbus.sessionBus();
const Variant = dbus.Variant;
const metadataObs = new Subject();

metadataObs
    .pipe(
        map(ii => ii.value),
        map(ii => ({
                trackid: ii['mpris:trackid'].value,
                length: ii['mpris:length'].value,
                artUrl: ii['mpris:artUrl'].value,
                album: ii['xesam:album'].value,
                artist: ii['xesam:albumArtist'].value,
                autoRating: ii['xesam:autoRating'].value,
                title: ii['xesam:title'].value,
                trackNumber: ii['xesam:trackNumber'].value,
                url: ii['xesam:url'].value
            })
        ),
        distinctUntilChanged((ii, jj) => ii.trackid === jj.trackid)
    ).subscribe((ii) => console.log('got signal', ii))
    



async function listen(){
    let obj = await bus.getProxyObject('org.mpris.MediaPlayer2.spotify', '/org/mpris/MediaPlayer2');
    let properties = obj.getInterface('org.freedesktop.DBus.Properties');
    let metadata = await properties.Get('org.mpris.MediaPlayer2.Player', 'Metadata');
    metadataObs.next(metadata);
    properties.on('PropertiesChanged', (iface, changed, invalidated) => {
        if(changed.Metadata)
        {
            metadataObs.next(changed.Metadata);
        }
    });
}
listen();


