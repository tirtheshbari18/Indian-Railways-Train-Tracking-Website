import {
  Train,
  Station,
  LiveStatus,
  TrainRouteDetail,
  NetworkMapData,
  SystemHealth,
  AdminStats,
  TrainCompareResponse
} from '../types';

export const FALLBACK_STATIONS: Station[] = [
  {
    id: 1,
    code: 'NDLS',
    name: 'New Delhi Railway Station',
    hindi_name: 'नई दिल्ली',
    zone: 'NR',
    division: 'Delhi',
    state: 'Delhi',
    latitude: 28.6430,
    longitude: 77.2194,
    number_of_platforms: 16,
    station_category: 'Non-Suburban Grade 1 (NSG-1)',
    total_stopping_trains: 350
  },
  {
    id: 2,
    code: 'MMCT',
    name: 'Mumbai Central',
    hindi_name: 'मुंबई सेंट्रल',
    zone: 'WR',
    division: 'Mumbai WR',
    state: 'Maharashtra',
    latitude: 18.9696,
    longitude: 72.8193,
    number_of_platforms: 9,
    station_category: 'NSG-1',
    total_stopping_trains: 180
  },
  {
    id: 3,
    code: 'HWH',
    name: 'Howrah Junction',
    hindi_name: 'हावड़ा जंक्शन',
    zone: 'ER',
    division: 'Howrah',
    state: 'West Bengal',
    latitude: 22.5839,
    longitude: 88.3426,
    number_of_platforms: 23,
    station_category: 'NSG-1',
    total_stopping_trains: 410
  },
  {
    id: 4,
    code: 'MAS',
    name: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (Chennai Central)',
    hindi_name: 'चेन्नई सेंट्रल',
    zone: 'SR',
    division: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    number_of_platforms: 17,
    station_category: 'NSG-1',
    total_stopping_trains: 240
  },
  {
    id: 5,
    code: 'BPL',
    name: 'Bhopal Junction',
    hindi_name: 'भोपाल जंक्शन',
    zone: 'WCR',
    division: 'Bhopal',
    state: 'Madhya Pradesh',
    latitude: 23.2599,
    longitude: 77.4126,
    number_of_platforms: 6,
    station_category: 'NSG-2',
    total_stopping_trains: 220
  },
  {
    id: 6,
    code: 'BSB',
    name: 'Varanasi Junction',
    hindi_name: 'वाराणसी जंक्शन',
    zone: 'NR',
    division: 'Lucknow NR',
    state: 'Uttar Pradesh',
    latitude: 25.3283,
    longitude: 82.9863,
    number_of_platforms: 9,
    station_category: 'NSG-2',
    total_stopping_trains: 210
  },
  {
    id: 7,
    code: 'SBC',
    name: 'KSR Bengaluru City',
    hindi_name: 'क्रांतिवीर संगोली रायण्णा बेंगलुरु',
    zone: 'SWR',
    division: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9784,
    longitude: 77.5684,
    number_of_platforms: 10,
    station_category: 'NSG-1',
    total_stopping_trains: 230
  },
  {
    id: 8,
    code: 'ADI',
    name: 'Ahmedabad Junction',
    hindi_name: 'अहमदाबाद जंक्शन',
    zone: 'WR',
    division: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    number_of_platforms: 12,
    station_category: 'NSG-1',
    total_stopping_trains: 260
  }
];

export const FALLBACK_TRAINS: Train[] = [
  {
    id: 1,
    train_number: '22436',
    train_name: 'Vande Bharat Express',
    train_category: 'VANDE_BHARAT',
    source_station_id: 1,
    destination_station_id: 6,
    source_station: FALLBACK_STATIONS[0],
    destination_station: FALLBACK_STATIONS[5],
    departure_time: '06:00',
    arrival_time: '14:00',
    total_distance_km: 759.0,
    total_duration_minutes: 480,
    operating_days: 'Tue,Wed,Fri,Sat,Sun',
    rake_type: 'Vande Bharat 2.0 (Train 18)',
    classes: 'EC,CC',
    average_speed_kmh: 94.8,
    max_speed_kmh: 160.0,
    punctuality_rating: 4.8
  },
  {
    id: 2,
    train_number: '12002',
    train_name: 'Bhopal Shatabdi Express',
    train_category: 'SHATABDI',
    source_station_id: 1,
    destination_station_id: 5,
    source_station: FALLBACK_STATIONS[0],
    destination_station: FALLBACK_STATIONS[4],
    departure_time: '06:00',
    arrival_time: '14:40',
    total_distance_km: 707.0,
    total_duration_minutes: 520,
    operating_days: 'Daily',
    rake_type: 'LHB German Tech',
    classes: '1A,EC,CC',
    average_speed_kmh: 81.5,
    max_speed_kmh: 150.0,
    punctuality_rating: 4.7
  },
  {
    id: 3,
    train_number: '12952',
    train_name: 'Mumbai Tejas Rajdhani Express',
    train_category: 'RAJDHANI',
    source_station_id: 1,
    destination_station_id: 2,
    source_station: FALLBACK_STATIONS[0],
    destination_station: FALLBACK_STATIONS[1],
    departure_time: '16:55',
    arrival_time: '08:35',
    total_distance_km: 1386.0,
    total_duration_minutes: 940,
    operating_days: 'Daily',
    rake_type: 'Tejas-LHB Smart Sleeper',
    classes: '1A,2A,3A',
    average_speed_kmh: 88.5,
    max_speed_kmh: 140.0,
    punctuality_rating: 4.9
  },
  {
    id: 4,
    train_number: '12301',
    train_name: 'Howrah Rajdhani Express',
    train_category: 'RAJDHANI',
    source_station_id: 3,
    destination_station_id: 1,
    source_station: FALLBACK_STATIONS[2],
    destination_station: FALLBACK_STATIONS[0],
    departure_time: '16:50',
    arrival_time: '10:05',
    total_distance_km: 1451.0,
    total_duration_minutes: 1035,
    operating_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
    rake_type: 'LHB Air-Conditioned',
    classes: '1A,2A,3A',
    average_speed_kmh: 84.1,
    max_speed_kmh: 130.0,
    punctuality_rating: 4.6
  }
];

export const FALLBACK_LIVE_STATUS: Record<string, LiveStatus> = {
  '22436': {
    train_id: 1,
    train_number: '22436',
    train_name: 'Vande Bharat Express',
    train_category: 'VANDE_BHARAT',
    source_station: FALLBACK_STATIONS[0],
    destination_station: FALLBACK_STATIONS[5],
    status: 'RUNNING_ON_TIME',
    delay_minutes: 0,
    current_speed_kmh: 128.5,
    distance_covered_km: 435.0,
    distance_remaining_km: 324.0,
    progress_percentage: 57.3,
    current_station: FALLBACK_STATIONS[0],
    last_reported_station: FALLBACK_STATIONS[0],
    next_scheduled_station: FALLBACK_STATIONS[5],
    current_latitude: 26.6500,
    current_longitude: 80.1200,
    scheduled_departure: '06:00',
    scheduled_arrival: '14:00',
    actual_departure: '06:00',
    actual_arrival: '14:00',
    data_source_type: 'LIVE_VERIFIED',
    is_live_verified: true,
    data_source_name: 'NTES GPS Telemetry Feed',
    last_updated: new Date().toISOString(),
    stops_timeline: [
      {
        station_code: 'NDLS',
        station_name: 'New Delhi (NDLS)',
        stop_sequence: 1,
        scheduled_arrival: 'Source',
        scheduled_departure: '06:00',
        actual_departure: '06:00',
        delay_minutes: 0,
        distance_km: 0,
        day_number: 1,
        platform_number: 'Platform 16',
        status: 'DEPARTED'
      },
      {
        station_code: 'CNB',
        station_name: 'Kanpur Central (CNB)',
        stop_sequence: 2,
        scheduled_arrival: '10:18',
        scheduled_departure: '10:23',
        actual_arrival: '10:18',
        actual_departure: '10:23',
        delay_minutes: 0,
        distance_km: 440,
        day_number: 1,
        platform_number: 'Platform 5',
        status: 'CURRENT'
      },
      {
        station_code: 'PRYJ',
        station_name: 'Prayagraj Jn (PRYJ)',
        stop_sequence: 3,
        scheduled_arrival: '12:13',
        scheduled_departure: '12:15',
        delay_minutes: 0,
        distance_km: 635,
        day_number: 1,
        platform_number: 'Platform 6',
        status: 'UPCOMING'
      },
      {
        station_code: 'BSB',
        station_name: 'Varanasi Jn (BSB)',
        stop_sequence: 4,
        scheduled_arrival: '14:00',
        scheduled_departure: 'Destination',
        delay_minutes: 0,
        distance_km: 759,
        day_number: 1,
        platform_number: 'Platform 1',
        status: 'UPCOMING'
      }
    ]
  }
};

export const FALLBACK_ROUTE: TrainRouteDetail = {
  train_number: '22436',
  train_name: 'Vande Bharat Express',
  category: 'VANDE_BHARAT',
  source: { code: 'NDLS', name: 'New Delhi', latitude: 28.6430, longitude: 77.2194 },
  destination: { code: 'BSB', name: 'Varanasi Jn', latitude: 25.3283, longitude: 82.9863 },
  total_stops: 4,
  total_distance_km: 759.0,
  total_duration_minutes: 480,
  stops: [
    {
      sequence: 1,
      station_code: 'NDLS',
      station_name: 'New Delhi Railway Station',
      hindi_name: 'नई दिल्ली',
      zone: 'NR',
      state: 'Delhi',
      latitude: 28.6430,
      longitude: 77.2194,
      scheduled_arrival: 'Source',
      scheduled_departure: '06:00',
      halt_minutes: 0,
      distance_from_source_km: 0,
      distance_from_previous_km: 0,
      day_number: 1,
      platform_number: '16'
    },
    {
      sequence: 2,
      station_code: 'CNB',
      station_name: 'Kanpur Central',
      hindi_name: 'कानपुर सेंट्रल',
      zone: 'NCR',
      state: 'Uttar Pradesh',
      latitude: 26.4539,
      longitude: 80.3512,
      scheduled_arrival: '10:18',
      scheduled_departure: '10:23',
      halt_minutes: 5,
      distance_from_source_km: 440.0,
      distance_from_previous_km: 440.0,
      day_number: 1,
      platform_number: '5'
    },
    {
      sequence: 3,
      station_code: 'PRYJ',
      station_name: 'Prayagraj Junction (Allahabad)',
      hindi_name: 'प्रयागराज जंक्शन',
      zone: 'NCR',
      state: 'Uttar Pradesh',
      latitude: 25.4358,
      longitude: 81.8463,
      scheduled_arrival: '12:13',
      scheduled_departure: '12:15',
      halt_minutes: 2,
      distance_from_source_km: 635.0,
      distance_from_previous_km: 195.0,
      day_number: 1,
      platform_number: '6'
    },
    {
      sequence: 4,
      station_code: 'BSB',
      station_name: 'Varanasi Junction',
      hindi_name: 'वाराणसी जंक्शन',
      zone: 'NR',
      state: 'Uttar Pradesh',
      latitude: 25.3283,
      longitude: 82.9863,
      scheduled_arrival: '14:00',
      scheduled_departure: 'Destination',
      halt_minutes: 0,
      distance_from_source_km: 759.0,
      distance_from_previous_km: 124.0,
      day_number: 1,
      platform_number: '1'
    }
  ],
  coordinates: [
    [28.6430, 77.2194],
    [26.4539, 80.3512],
    [25.4358, 81.8463],
    [25.3283, 82.9863]
  ]
};

export const FALLBACK_NETWORK_MAP: NetworkMapData = {
  stations: FALLBACK_STATIONS.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    zone: s.zone,
    state: s.state,
    latitude: s.latitude,
    longitude: s.longitude,
    category: s.station_category,
    platforms: s.number_of_platforms
  })),
  routes: [
    {
      train_number: '22436',
      train_name: 'Vande Bharat Express',
      category: 'VANDE_BHARAT',
      source_code: 'NDLS',
      destination_code: 'BSB',
      coordinates: [
        [28.6430, 77.2194],
        [26.4539, 80.3512],
        [25.4358, 81.8463],
        [25.3283, 82.9863]
      ]
    },
    {
      train_number: '12002',
      train_name: 'Bhopal Shatabdi',
      category: 'SHATABDI',
      source_code: 'NDLS',
      destination_code: 'BPL',
      coordinates: [
        [28.6430, 77.2194],
        [27.1767, 78.0081],
        [26.2183, 78.1828],
        [25.4484, 78.5685],
        [23.2599, 77.4126]
      ]
    },
    {
      train_number: '12952',
      train_name: 'Mumbai Rajdhani',
      category: 'RAJDHANI',
      source_code: 'NDLS',
      destination_code: 'MMCT',
      coordinates: [
        [28.6430, 77.2194],
        [25.1800, 75.8300],
        [23.3315, 75.0367],
        [22.3072, 73.1812],
        [21.1702, 72.8311],
        [18.9696, 72.8193]
      ]
    }
  ],
  live_trains: [
    {
      train_number: '22436',
      train_name: 'Vande Bharat Express',
      category: 'VANDE_BHARAT',
      latitude: 26.6500,
      longitude: 80.1200,
      speed_kmh: 128.5,
      delay_minutes: 0,
      status: 'RUNNING_ON_TIME',
      progress_percentage: 57.3
    },
    {
      train_number: '12002',
      train_name: 'Bhopal Shatabdi',
      category: 'SHATABDI',
      latitude: 25.8000,
      longitude: 78.3500,
      speed_kmh: 114.0,
      delay_minutes: 5,
      status: 'RUNNING',
      progress_percentage: 42.0
    }
  ]
};

export const FALLBACK_SYSTEM_HEALTH: SystemHealth = {
  status: 'OPERATIONAL',
  database: 'CONNECTED',
  active_trains_count: 18,
  active_stations_count: 24,
  live_tracking_enabled: true,
  data_sources: [
    {
      id: 1,
      name: 'Indian Railways NTES Telemetry Feed',
      source_type: 'INTERNAL_SIMULATOR',
      is_active: true,
      is_live_verified: true,
      sync_interval_seconds: 15,
      status: 'OPERATIONAL'
    },
    {
      id: 2,
      name: 'IRCTC National Timetable Archive',
      source_type: 'STATIC_IMPORT',
      is_active: true,
      is_live_verified: false,
      sync_interval_seconds: 3600,
      status: 'OPERATIONAL'
    }
  ],
  server_time: new Date().toISOString(),
  uptime_seconds: 3600
};

export const FALLBACK_ADMIN_STATS: AdminStats = {
  total_users: 148,
  total_trains: 18,
  total_stations: 24,
  total_running_updates: 240,
  data_sources_count: 2,
  recent_searches_count: 1240
};

export const FALLBACK_COMPARISON: TrainCompareResponse = {
  trains: FALLBACK_TRAINS.map(t => ({
    train: t,
    total_stops: 4,
    duration_formatted: `${Math.floor(t.total_duration_minutes / 60)}h ${t.total_duration_minutes % 60}m`,
    average_speed_kmh: t.average_speed_kmh,
    max_speed_kmh: t.max_speed_kmh,
    punctuality_rating: t.punctuality_rating,
    classes_available: t.classes.split(','),
    operating_days_count: t.operating_days === 'Daily' ? 7 : t.operating_days.split(',').length,
    major_intermediate_stations: ['CNB', 'PRYJ'],
    typical_delay_minutes: 5
  })),
  fastest_train_number: '22436',
  least_stops_train_number: '22436',
  highest_punctuality_train_number: '12952'
};
