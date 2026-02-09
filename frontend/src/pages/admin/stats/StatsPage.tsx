import React, { useEffect, useState } from 'react';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import StatsService, {
  type GlobalApplicationStatsDto,
  type GlobalOfferStatsDto,
  type GlobalUserStatsDto,
  statsPeriods,
  type TemporalApplicationStatsDto,
  type TemporalOfferStatsDto,
  type TemporalUserStatsDto
} from '../../../services/stats.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './StatsPage.css';

const StatsPage: React.FC = () => {
  const [globalUserStats, setGlobalUserStats] = useState<GlobalUserStatsDto | null>(null);
  const [globalOfferStats, setGlobalOfferStats] = useState<GlobalOfferStatsDto | null>(null);
  const [globalApplicationStats, setGlobalApplicationStats] = useState<GlobalApplicationStatsDto | null>(null);

  const [temporalUserStats, setTemporalUserStats] = useState<TemporalUserStatsDto | null>(null);
  const [temporalOfferStats, setTemporalOfferStats] = useState<TemporalOfferStatsDto | null>(null);
  const [temporalApplicationStats, setTemporalApplicationStats] = useState<TemporalApplicationStatsDto | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(statsPeriods.DAY);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const [users, offers, applications] = await Promise.all([
          StatsService.getGlobalUserStats(),
          StatsService.getGlobalOfferStats(),
          StatsService.getGlobalApplicationStats(),
        ]);
        setGlobalUserStats(users);
        setGlobalOfferStats(offers);
        setGlobalApplicationStats(applications);
      } catch (error) {
        console.error("Error fetching global stats", error);
      }
    };

    fetchGlobalStats();
  }, []);

  useEffect(() => {
    const fetchTemporalStats = async () => {
      setLoading(true);
      try {
        const [users, offers, applications] = await Promise.all([
          StatsService.getTemporalUserStats(selectedPeriod),
          StatsService.getTemporalOfferStats(selectedPeriod),
          StatsService.getTemporalApplicationStats(selectedPeriod),
        ]);
        setTemporalUserStats(users);
        setTemporalOfferStats(offers);
        setTemporalApplicationStats(applications);
      } catch (error) {
        console.error("Error fetching temporal stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemporalStats();
  }, [selectedPeriod]);

  const generateLabels = (period: string, count: number): string[] => {
    const labels: string[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const date = new Date(now);
      if (period === statsPeriods.DAY) {
        date.setHours(now.getHours() - (count - 1 - i));
        labels.push(date.getHours() + 'h');
      } else if (period === statsPeriods.WEEK) {
        date.setDate(now.getDate() - (count - 1 - i));
        labels.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
      } else if (period === statsPeriods.MONTH) {
        date.setDate(now.getDate() - (count - 1 - i * 7));
        labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
      } else if (period === statsPeriods.YEAR) {
        date.setMonth(now.getMonth() - (count - 1 - i));
        labels.push(date.toLocaleDateString('fr-FR', { month: 'short' }));
      } else {
          labels.push(`${i + 1}`);
      }
    }
    return labels;
  };

  const formatDataForChart = (data: number[] | undefined, label: string) => {
      if (!data) return [];
      const labels = generateLabels(selectedPeriod, data.length);
      // We keep the reversed data (newest to oldest) as requested
      const reversedData = [...data].reverse();
      return reversedData.map((value, index) => ({
          name: labels[index],
          [label]: value
      }));
  };

  const formatUserDataForChart = (students: number[] | undefined, companies: number[] | undefined) => {
      if (!students || !companies) return [];
      const maxLength = Math.max(students.length, companies.length);
      const labels = generateLabels(selectedPeriod, maxLength);

      const reversedStudents = [...students].reverse();
      const reversedCompanies = [...companies].reverse();

      const data = [];
      for(let i = 0; i < maxLength; i++) {
          data.push({
              name: labels[i],
              students: reversedStudents[i] || 0,
              companies: reversedCompanies[i] || 0
          });
      }
      return data;
  }

  if (!globalUserStats || !globalOfferStats || !globalApplicationStats) {
      return (
          <div className="stats-page-wrapper">
              <Header />
              <div className="loading-container">Chargement des statistiques...</div>
              <Footer />
          </div>
      );
  }

  const userData = formatUserDataForChart(temporalUserStats?.students, temporalUserStats?.companies);
  const offerData = formatDataForChart(temporalOfferStats?.offers, 'offers');
  const applicationData = formatDataForChart(temporalApplicationStats?.applications, 'applications');

  return (
    <div className="stats-page-wrapper">
      <Header />
      <main className="stats-container">
        <div className="stats-header">
          <h1>Statistiques</h1>
          <p>Vue d'ensemble des activités sur la plateforme</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Utilisateurs</h3>
            <div className="stat-value">
              {globalUserStats.totalStudents + globalUserStats.totalCompanies}
            </div>
            <p className="text-muted">
              {globalUserStats.totalStudents} Étudiants, {globalUserStats.totalCompanies} Entreprises
            </p>
          </div>
          <div className="stat-card">
            <h3>Offres de stage</h3>
            <div className="stat-value">{globalOfferStats.totalOffers}</div>
          </div>
          <div className="stat-card">
            <h3>Candidatures</h3>
            <div className="stat-value">{globalApplicationStats.totalApplications}</div>
          </div>
        </div>

        <div className="chart-header">
          <h2>Évolution temporelle</h2>
          <select
              className="period-selector"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
          >
              <option value={statsPeriods.DAY}>Par Jour</option>
              <option value={statsPeriods.WEEK}>Par Semaine</option>
              <option value={statsPeriods.MONTH}>Par Mois</option>
              <option value={statsPeriods.YEAR}>Par Année</option>
          </select>
        </div>

        {loading ? (
            <div className="loading-container">Chargement des données graphiques...</div>
        ) : (
            <div className="charts-section">
              <div className="chart-container">
                <h3>Utilisateurs</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={userData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="students" stroke="#8884d8" name="Étudiants" />
                      <Line type="monotone" dataKey="companies" stroke="#82ca9d" name="Entreprises" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-container">
                <h3>Offres</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={offerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="offers" stroke="#8884d8" name="Offres" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-container">
                <h3>Candidatures</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={applicationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="applications" stroke="#ff7300" name="Candidatures" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StatsPage;