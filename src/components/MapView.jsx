import React, { useEffect, useRef, useState } from "react";

const MapView = ({ selectedSpot, spots = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoRef = useRef(null);

  // 지도가 준비되었는지 확인하는 스위치
  const [mapReady, setMapReady] = useState(false);

  // 1. 카카오 스크립트 로드 및 지도 초기 생성
  useEffect(() => {
    console.log("🔍 1. MapView 화면 등장!");

    // 지도 초기화 함수
    const initMap = () => {
      if (!mapRef.current) return;

      console.log("🗺️ 지도 객체 생성 시작!");
      const center = new window.kakao.maps.LatLng(37.5665, 126.978);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 5,
      });

      mapInstanceRef.current = map;
      infoRef.current = new window.kakao.maps.InfoWindow({
        zIndex: 10,
        removable: true,
      });

      console.log("🗺️ 지도 생성 완료!");
      setMapReady(true); // 지도가 완전히 생성되었음을 알림
    };

    // 이미 스크립트와 객체가 존재한다면 바로 초기화
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      console.log("✅ 카카오맵 이미 존재함");
      initMap();
      return;
    }

    // 스크립트 동적 생성 (올바른 자바스크립트 키)
    const script = document.createElement("script");
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=2574230cc666ba203e4d46b62d22d7ca&autoload=false";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log("✅ 카카오 스크립트 다운로드 완료!");
      window.kakao.maps.load(() => {
        console.log("✅ 카카오맵 로드(load) 완료!");
        initMap();
      });
    };

    script.onerror = () => {
      console.error("❌ 카카오 스크립트 다운로드 실패");
    };
  }, []);

  // 2. 와이파이 마커 그리기 (mapReady와 spots가 변경될 때만 실행)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // 기존 마커 지우기
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!spots || spots.length === 0) {
      console.log("📌 표시할 와이파이 목록이 없습니다.");
      return;
    }

    console.log(`📌 ${spots.length}개의 마커 그리기 시작!`);
    spots.forEach((spot) => {
      if (!spot.lat || !spot.lng) return;

      const position = new window.kakao.maps.LatLng(
        Number(spot.lat),
        Number(spot.lng),
      );
      const marker = new window.kakao.maps.Marker({ position, map });

      marker.spot = spot;
      markersRef.current.push(marker);

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (infoRef.current) {
          infoRef.current.setContent(
            `<div style="padding:10px; min-width:180px; color:#333; font-family:sans-serif;">
                            <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${spot.name}</div>
                            <div style="font-size:12px; color:#666;">${spot.detail || "-"}</div>
                            <div style="font-size:12px; color:#666; margin-top:4px;">📞 ${spot.phone || "-"}</div>
                        </div>`,
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

    const marker = markersRef.current.find(
      (m) => m.spot?.name === selectedSpot.name,
    );
    if (marker && infoRef.current) {
      infoRef.current.setContent(
        `<div style="padding:10px; min-width:180px; color:#333; font-family:sans-serif;">
                    <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${selectedSpot.name}</div>
                    <div style="font-size:12px; color:#666;">${selectedSpot.detail || "-"}</div>
                    <div style="font-size:12px; color:#666; margin-top:4px;">📞 ${selectedSpot.phone || "-"}</div>
                </div>`,
      );
      infoRef.current.open(map, marker);
    }
  }, [mapReady, selectedSpot]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        borderRadius: "1rem",
        backgroundColor: "#e5e5e5",
      }}
    />
  );
};

export default MapView;
