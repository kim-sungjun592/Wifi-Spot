import React, { useEffect, useRef, useState } from 'react'

const MapView = ({ selectedSpot, spots = [] }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])
    const infoRef = useRef(null)
    
    // 지도가 준비되었는지 확인하는 스위치
    const [mapReady, setMapReady] = useState(false)

    // 1. 카카오 스크립트 안전하게 불러오기
    useEffect(() => {
        console.log("🔍 1. MapView 화면 등장! 카카오 스크립트 불러오기 시작");
        
        // 이미 스크립트가 있다면 바로 준비 완료!
        if (window.kakao && window.kakao.maps) {
            console.log("✅ 2. 카카오맵 이미 불러와져 있음!");
            setMapReady(true);
            return;
        }

        // 스크립트 직접 만들어서 HTML에 쏙 넣기 (새로운 자바스크립트 키 적용!)
        const script = document.createElement('script');
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=2574230cc666ba203e4d46b62d22d7ca&autoload=false';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            console.log("✅ 3. 카카오 스크립트 다운로드 완료!");
            window.kakao.maps.load(() => {
                console.log("✅ 4. 지도 그릴 준비 100% 완료 (load 실행됨)!");
                setMapReady(true);
            });
        };
        
        script.onerror = () => {
            console.error("❌ 카카오 스크립트를 다운로드하는 데 실패했습니다. 주소(포트)나 앱키를 확인하세요.");
        }
    }, []);

    // 2. 지도와 마커 그리기
    useEffect(() => {
        if (!mapReady) {
            console.log("⏳ 5. 아직 준비 안 됨... 기다리는 중");
            return;
        }
        if (!mapRef.current) {
            console.log("❌ 화면에 지도를 그릴 공간(div)이 없음!");
            return;
        }

        console.log("🗺️ 6. 드디어 지도 그리기 시작!");
        
        // 지도 처음 한 번만 생성
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
            console.log("🗺️ 지도 생성 완료!");
        }

        // --- 여기서부터 마커 생성 ---
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        
        if (!spots || spots.length === 0) {
            console.log("📌 표시할 와이파이 목록이 없습니다.");
            return;
        }

        console.log(`📌 ${spots.length}개의 마커 그리기 시작!`);
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
        
        console.log(`🎯 선택된 장소로 이동: ${selectedSpot.name}`);
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