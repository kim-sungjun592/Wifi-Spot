import React, { useEffect, useRef, useState } from 'react'

const MapView = ({ selectedSpot, spots = [] }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])
    const infoRef = useRef(null)
    
    const [mapReady, setMapReady] = useState(false)

    // 💡 1. 카카오 스크립트 다운로드 코드 삭제! (index.html에서 이미 가져왔기 때문)
    useEffect(() => {
        // window.kakao가 있으면 바로 지도를 그릴 준비(load)만 딱 시켜줌!
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
                console.log("✅ 카카오맵 준비 완료!");
                setMapReady(true);
            });
        } else {
            console.error("❌ 카카오맵 스크립트를 찾을 수 없습니다. index.html을 확인하세요.");
        }
    }, []);

    // 2. 지도와 마커 그리기 (이 아래는 네가 짠 완벽한 코드 그대로야!)
    useEffect(() => {
        if (!mapReady) return;
        if (!mapRef.current) return;
        
        let map = mapInstanceRef.current;
        if (!map) {
            const center = new window.kakao.maps.LatLng(37.5665, 126.978);
            map = new window.kakao.maps.Map(mapRef.current, {
                center,
                level: 5,
            });
            mapInstanceRef.current = map;
            
            infoRef.current = new window.kakao.maps.InfoWindow({
                zIndex: 10,
                removable: true,
            });
        }

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        
        if (!spots || spots.length === 0) return;

        spots.forEach((spot) => {
            if (!spot.lat || !spot.lng) return;
            
            const position = new window.kakao.maps.LatLng(Number(spot.lat), Number(spot.lng));
            const marker = new window.kakao.maps.Marker({ position, map });
            
            marker.spot = spot;
            markersRef.current.push(marker);
            
            window.kakao.maps.event.addListener(marker, 'click', () => {
                if (infoRef.current) {
                    infoRef.current.setContent(
                        `<div style="padding:10px; min-width:180px; color:#333; font-family:sans-serif;">
                            <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${spot.name}</div>
                            <div style="font-size:12px; color:#666;">${spot.detail || '-'}</div>
                            <div style="font-size:12px; color:#666; margin-top:4px;">📞 ${spot.phone || '-'}</div>
                        </div>`
                    );
                    infoRef.current.open(map, marker);
                }
            });
        });
    }, [mapReady, spots]);

    // 3. 리스트 클릭 시 지도 이동
    useEffect(() => {
        if (!mapReady || !selectedSpot || !mapInstanceRef.current) return;
        
        const map = mapInstanceRef.current;
        const { lat, lng } = selectedSpot;
        const position = new window.kakao.maps.LatLng(Number(lat), Number(lng));
        
        map.setCenter(position);
        map.setLevel(3);

        const marker = markersRef.current.find(m => m.spot?.name === selectedSpot.name);
        if (marker && infoRef.current) {
            infoRef.current.setContent(
                `<div style="padding:10px; min-width:180px; color:#333; font-family:sans-serif;">
                    <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${selectedSpot.name}</div>
                    <div style="font-size:12px; color:#666;">${selectedSpot.detail || '-'}</div>
                    <div style="font-size:12px; color:#666; margin-top:4px;">📞 ${selectedSpot.phone || '-'}</div>
                </div>`
            );
            infoRef.current.open(map, marker);
        }
    }, [mapReady, selectedSpot]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '1rem', backgroundColor: '#e5e5e5' }} />
}

export default MapView